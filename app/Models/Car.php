<?php

declare(strict_types=1);

namespace App\Models;

use App\DataTransferObjects\RentalDates;
use App\Enums\CarCategory;
use App\Enums\Transmission;
use Database\Factories\CarFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property int $seats
 * @property Transmission $transmission
 * @property CarCategory $category
 * @property int $daily_rate_in_grosze
 * @property string $image_path path on the public disk without the width suffix and extension, e.g. `cars/bmw-m5`
 */
class Car extends Model
{
    /** @use HasFactory<CarFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['name', 'seats', 'transmission', 'category', 'daily_rate_in_grosze', 'image_path'];

    /** @return HasMany<Booking, $this> */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /** @param  Builder<Car>  $query */
    public function scopeWithMinimumSeats(Builder $query, int $minimumSeats): void
    {
        $query->where('seats', '>=', $minimumSeats);
    }

    /** @param  Builder<Car>  $query */
    public function scopeWithTransmission(Builder $query, Transmission $transmission): void
    {
        $query->where('transmission', $transmission);
    }

    /** @param  Builder<Car>  $query */
    public function scopeAvailableDuring(Builder $query, RentalDates $dates): void
    {
        $query->whereDoesntHave(
            'bookings',
            fn (Builder $bookings) => $bookings
                ->active()
                ->overlapping($dates->startsOn, $dates->endsOn),
        );
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'seats' => 'integer',
            'transmission' => Transmission::class,
            'category' => CarCategory::class,
            'daily_rate_in_grosze' => 'integer',
        ];
    }
}
