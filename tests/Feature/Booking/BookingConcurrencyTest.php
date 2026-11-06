<?php

declare(strict_types=1);

use App\Models\Booking;
use App\Models\Car;
use App\Models\User;
use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\Test;
use Symfony\Component\Process\Process;

#[Group('mysql')]
final class BookingConcurrencyTest extends TestCase
{
    #[Test]
    public function concurrent_requests_for_an_empty_period_create_exactly_one_booking(): void
    {
        if (DB::connection()->getDriverName() !== 'mysql') {
            $this->markTestSkipped('Requires MySQL.');
        }

        $this->artisan('migrate', ['--force' => true])->assertSuccessful();
        $car = Car::factory()->create(['daily_rate_in_grosze' => 18000]);
        $user = User::factory()->create();
        $barrierDirectory = sys_get_temp_dir().'/drivebook-concurrency-'.bin2hex(random_bytes(8));
        mkdir($barrierDirectory, 0700);
        $workers = [];

        try {
            self::assertSame(0, Booking::query()->where('car_id', $car->id)->count());
            DB::beginTransaction();
            Car::query()->whereKey($car->id)->lockForUpdate()->firstOrFail();
            for ($worker = 1; $worker <= 2; $worker++) {
                $process = new Process([
                    PHP_BINARY,
                    base_path('tests/Support/concurrent-booking.php'),
                    (string) $user->id,
                    (string) $car->id,
                    now(config('rental.timezone'))->addDays(10)->toDateString(),
                    now(config('rental.timezone'))->addDays(12)->toDateString(),
                    '18000',
                    $barrierDirectory,
                    (string) $worker,
                ], base_path(), [
                    'APP_ENV' => 'testing',
                    'DB_CONNECTION' => 'mysql',
                    'DB_HOST' => (string) config('database.connections.mysql.host'),
                    'DB_PORT' => (string) config('database.connections.mysql.port'),
                    'DB_DATABASE' => DB::connection()->getDatabaseName(),
                    'DB_USERNAME' => (string) config('database.connections.mysql.username'),
                    'DB_PASSWORD' => (string) config('database.connections.mysql.password'),
                    'SESSION_DRIVER' => 'array',
                    'CACHE_STORE' => 'array',
                ], timeout: 20);
                $process->start();
                $workers[] = $process;
            }

            $this->waitUntil(fn (): bool => count(glob($barrierDirectory.'/ready-*')) === 2, $workers);
            $connectionIds = array_map(static fn (string $path): int => (int) file_get_contents($path), glob($barrierDirectory.'/ready-*'));
            self::assertCount(2, array_unique($connectionIds));
            touch($barrierDirectory.'/go');

            $this->waitUntil(function () use ($connectionIds): bool {
                $waiting = DB::selectOne(
                    'SELECT COUNT(DISTINCT t.PROCESSLIST_ID) AS waiting FROM performance_schema.data_lock_waits w JOIN performance_schema.threads t ON t.THREAD_ID = w.REQUESTING_THREAD_ID WHERE t.PROCESSLIST_ID IN (?, ?)',
                    [$connectionIds[0], $connectionIds[1]],
                );

                return (int) $waiting->waiting === 2;
            }, $workers);
            DB::commit();

            $outcomes = [];
            foreach ($workers as $process) {
                $process->wait();
                self::assertTrue($process->isSuccessful(), $process->getErrorOutput());
                $result = json_decode($process->getOutput(), true, flags: JSON_THROW_ON_ERROR);
                $outcomes[] = $result['outcome'];
            }
            sort($outcomes);
            self::assertSame(['created', 'rejected'], $outcomes);
            self::assertSame(1, Booking::query()->where('car_id', $car->id)->where('status', 'confirmed')->count());
        } finally {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
            foreach ($workers as $process) {
                if ($process->isRunning()) {
                    $process->stop();
                }
            }
            Booking::query()->where('car_id', $car->id)->delete();
            $car->delete();
            $user->delete();
            foreach (glob($barrierDirectory.'/*') as $path) {
                unlink($path);
            }
            rmdir($barrierDirectory);
        }
    }

    /** @param list<Process> $workers */
    private function waitUntil(Closure $condition, array $workers): void
    {
        $deadline = hrtime(true) + 10_000_000_000;
        while (! $condition()) {
            foreach ($workers as $process) {
                self::assertTrue($process->isRunning(), $process->getOutput().$process->getErrorOutput());
            }
            self::assertLessThan($deadline, hrtime(true), 'Both independent requests must reach the synchronization point.');
            usleep(10000);
        }
    }
}
