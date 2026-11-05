<?php

declare(strict_types=1);

namespace App\Http\Requests\Concerns;

use App\Services\Cars\RentalWindow;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Config;
use Illuminate\Validation\Validator;

trait ValidatesRentalPeriod
{
    /** @return list<callable(Validator): void> */
    public function after(RentalWindow $rentalWindow): array
    {
        return [
            function (Validator $validator) use ($rentalWindow): void {
                if ($validator->errors()->hasAny(['starts_on', 'ends_on']) || ! $this->filled(['starts_on', 'ends_on'])) {
                    return;
                }

                $startsOn = $this->dateInRentalTimezone('starts_on');
                $endsOn = $this->dateInRentalTimezone('ends_on');
                $pickupViolation = $rentalWindow->pickupViolation($startsOn);
                $lengthViolation = $rentalWindow->lengthViolation($startsOn, $endsOn);

                if ($pickupViolation !== null) {
                    $validator->errors()->add('starts_on', $pickupViolation);
                }

                if ($lengthViolation !== null) {
                    $validator->errors()->add('ends_on', $lengthViolation);
                }
            },
        ];
    }

    /** @return array<string, list<string>> */
    protected function rentalPeriodRules(): array
    {
        return [
            'starts_on' => ['bail', 'required_with:ends_on', 'date_format:Y-m-d'],
            'ends_on' => ['bail', 'required_with:starts_on', 'date_format:Y-m-d', 'after:starts_on'],
        ];
    }

    private function dateInRentalTimezone(string $key): CarbonImmutable
    {
        return CarbonImmutable::parse($this->string($key)->toString(), Config::string('rental.timezone'))->startOfDay();
    }
}
