<?php

declare(strict_types=1);

use App\DataTransferObjects\BookingData;
use App\Services\Booking\BookingService;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

require dirname(__DIR__, 2).'/vendor/autoload.php';
$app = require dirname(__DIR__, 2).'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

[$script, $userId, $carId, $startsOn, $endsOn, $rate, $barrierDirectory, $worker] = $argv;
$connection = DB::selectOne('SELECT CONNECTION_ID() AS id');
file_put_contents($barrierDirectory.'/ready-'.$worker, (string) $connection->id);
$deadline = hrtime(true) + 15_000_000_000;
while (! is_file($barrierDirectory.'/go')) {
    if (hrtime(true) > $deadline) {
        fwrite(STDERR, 'Timed out waiting for the shared start barrier.');
        exit(1);
    }
    usleep(1000);
}

$timezone = config('rental.timezone');

try {
    $app->make(BookingService::class)->store(new BookingData(
        (int) $carId,
        (int) $userId,
        CarbonImmutable::parse($startsOn, $timezone)->startOfDay(),
        CarbonImmutable::parse($endsOn, $timezone)->startOfDay(),
        (int) $rate,
    ));
    fwrite(STDOUT, json_encode(['outcome' => 'created'], JSON_THROW_ON_ERROR));
} catch (ValidationException) {
    fwrite(STDOUT, json_encode(['outcome' => 'rejected'], JSON_THROW_ON_ERROR));
} catch (Throwable $exception) {
    fwrite(STDERR, (string) $exception);
    exit(1);
}
