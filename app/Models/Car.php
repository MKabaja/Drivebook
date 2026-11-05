<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CarCategory;
use App\Enums\Transmission;
use Database\Factories\CarFactory;
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
 * @property string $image_path
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
