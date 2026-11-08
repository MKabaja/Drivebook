<?php

declare(strict_types=1);

namespace App\Enums;

enum CarCategory: string
{
    case City = 'city';
    case Compact = 'compact';
    case Family = 'family';
    case Suv = 'suv';
    case Van = 'van';
    case Premium = 'premium';
    case Sport = 'sport';
}
