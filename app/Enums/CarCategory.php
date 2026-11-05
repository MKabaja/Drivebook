<?php

declare(strict_types=1);

namespace App\Enums;

enum CarCategory: string
{
    case Sport = 'sport';
    case GrandTourer = 'grand_tourer';
    case Muscle = 'muscle';
    case Sedan = 'sedan';
    case Estate = 'estate';
}
