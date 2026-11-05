<?php

declare(strict_types=1);

namespace App\Exceptions;

use RuntimeException;

final class DailyRateChanged extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('The daily rate has changed. Please review the updated price.');
    }
}
