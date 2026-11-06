<?php

declare(strict_types=1);

namespace App\Exceptions;

use RuntimeException;

/**
 * Rendered as HTTP 409 in `bootstrap/app.php`.
 */
final class DailyRateChanged extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('The daily rate has changed. Please review the updated price.');
    }
}
