<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\Transmission;
use App\Http\Requests\Concerns\ValidatesRentalDates;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SearchCarsRequest extends FormRequest
{
    use ValidatesRentalDates;

    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            ...$this->rentalDatesRules(),
            'seats' => ['sometimes', 'required', 'integer', 'min:1'],
            'transmission' => ['sometimes', 'required', Rule::enum(Transmission::class)],
            'page' => ['sometimes', 'required', 'integer', 'min:1'],
        ];
    }
}
