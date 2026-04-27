import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateValue(value: string) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

type DatePickerInputProps = {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  minValue?: string;
  placeholder?: string;
  className?: string;
};

export function DatePickerInput({
  id,
  label,
  value,
  onValueChange,
  minValue,
  placeholder = "mm-dd-yyyy",
  className,
}: DatePickerInputProps) {
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date | undefined>(
    parseDateValue(value),
  );
  const [inputValue, setInputValue] = React.useState(() => {
    const date = parseDateValue(value);

    return formatDate(date) || value;
  });

  React.useEffect(() => {
    const date = parseDateValue(value);

    setMonth(date);
    setInputValue(formatDate(date) || value);
  }, [value]);

  function isBeforeMinimum(nextValue: string) {
    return Boolean(minValue && nextValue < minValue);
  }

  return (
    <Field className={cn("w-full", className)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={id}
          value={inputValue}
          placeholder={placeholder}
          onChange={(event) => {
            const nextValue = event.target.value;
            setInputValue(nextValue);

            if (!nextValue.trim()) {
              onValueChange("");
              return;
            }

            const nextDate = new Date(nextValue);
            const nextDateValue = formatDateValue(nextDate);

            if (isBeforeMinimum(nextDateValue)) {
              setInputValue(formatDate(parseDateValue(value)) || value);
              return;
            }

            if (!Number.isNaN(nextDate.getTime())) {
              setMonth(nextDate);
              onValueChange(nextDateValue);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <InputGroupButton
                id={`${id}-picker`}
                variant="ghost"
                size="icon-xs"
                aria-label="Select date"
              >
                <CalendarIcon />
                <span className="sr-only">Select date</span>
              </InputGroupButton>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                mode="single"
                selected={parseDateValue(value)}
                month={month}
                onMonthChange={setMonth}
                disabled={(date) =>
                  Boolean(minValue && formatDateValue(date) < minValue)
                }
                onSelect={(nextDate) => {
                  if (nextDate && isBeforeMinimum(formatDateValue(nextDate))) {
                    return;
                  }

                  setInputValue(formatDate(nextDate));
                  setMonth(nextDate);
                  onValueChange(nextDate ? formatDateValue(nextDate) : "");
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}
