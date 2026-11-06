<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\BookingStatus;
use Carbon\CarbonImmutable;
use Database\Factories\BookingFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Config;

/**
 * @property int $id
 * @property int $car_id
 * @property int $user_id
 * @property CarbonImmutable $starts_on
 * @property CarbonImmutable $ends_on
 * @property BookingStatus $status
 * @property int $daily_rate_in_grosze
 * @property int $total_price_in_grosze
 * @property CarbonImmutable $created_at
 * @property CarbonImmutable $updated_at
 */
class Booking extends Model
{
    /** @use HasFactory<BookingFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'car_id', 'user_id', 'starts_on', 'ends_on', 'status',
        'daily_rate_in_grosze', 'total_price_in_grosze',
    ];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Car, $this> */
    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }

    /** @param  Builder<Booking>  $query */
    public function scopeActive(Builder $query): void
    {
        $query->where('status', BookingStatus::Confirmed);
    }

    /**
     * Half-open `[$start, $end)`: bookings that only touch the range do not overlap.
     *
     * @param  Builder<Booking>  $query
     */
    public function scopeOverlapping(Builder $query, CarbonImmutable $start, CarbonImmutable $end): void
    {
        $query->where('starts_on', '<', $end->toDateString())
            ->where('ends_on', '>', $start->toDateString());
    }

    public function pickupAt(): CarbonImmutable
    {
        return CarbonImmutable::parse(
            $this->starts_on->toDateString().' '.Config::string('rental.pickup_time'),
            Config::string('rental.timezone'),
        );
    }

    public function canCancel(CarbonImmutable $now): bool
    {
        return $this->status === BookingStatus::Confirmed && $now->isBefore($this->pickupAt());
    }

    public function rentalDays(): int
    {
        return (int) $this->starts_on->diffInDays($this->ends_on);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'status' => BookingStatus::class,
            'starts_on' => 'immutable_date',
            'ends_on' => 'immutable_date',
            'daily_rate_in_grosze' => 'integer',
            'total_price_in_grosze' => 'integer',
            'created_at' => 'immutable_datetime',
            'updated_at' => 'immutable_datetime',
        ];
    }
}
