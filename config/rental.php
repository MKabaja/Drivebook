<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Rental rules
    |--------------------------------------------------------------------------
    |
    | Domain constants of the single DriveBook branch. Calendar dates are
    | interpreted in this time zone; pickup and return happen at the same
    | local time, so a rental lasts whole days.
    |
    */

    'timezone' => 'Europe/Warsaw',

    'pickup_time' => '10:00',

    'max_rental_days' => 30,

    'booking_horizon_days' => 180,

    'alternative_dates_window_days' => 30,

    'cars_per_page' => 12,

    'bookings_per_page' => 15,

];
