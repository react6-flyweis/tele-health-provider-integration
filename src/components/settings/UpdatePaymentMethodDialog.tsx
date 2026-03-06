import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  CreditCard,
  //   Landmark,
  Save,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type PaymentMethodType = "bank" | "debit";

const paymentMethodSchema = z
  .object({
    method: z.enum(["bank", "debit"]),
    accountHolderName: z
      .string()
      .trim()
      .min(1, "Account holder name is required"),
    bankName: z.string().trim().optional(),
    accountNumber: z.string().trim().optional(),
    routingNumber: z.string().trim().optional(),
    accountType: z.string().trim().optional(),
    cardNumber: z.string().trim().optional(),
    expiryDate: z.string().trim().optional(),
    cvv: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.method === "bank") {
      if (!data.bankName) {
        ctx.addIssue({
          code: "custom",
          message: "Bank name is required",
          path: ["bankName"],
        });
      }

      if (!data.accountNumber) {
        ctx.addIssue({
          code: "custom",
          message: "Account number is required",
          path: ["accountNumber"],
        });
      }

      if (!data.routingNumber) {
        ctx.addIssue({
          code: "custom",
          message: "Routing number is required",
          path: ["routingNumber"],
        });
      }

      if (!data.accountType) {
        ctx.addIssue({
          code: "custom",
          message: "Account type is required",
          path: ["accountType"],
        });
      }

      return;
    }

    if (!data.cardNumber) {
      ctx.addIssue({
        code: "custom",
        message: "Card number is required",
        path: ["cardNumber"],
      });
    }

    if (!data.expiryDate) {
      ctx.addIssue({
        code: "custom",
        message: "Expiry date is required",
        path: ["expiryDate"],
      });
    }

    if (!data.cvv) {
      ctx.addIssue({
        code: "custom",
        message: "CVV is required",
        path: ["cvv"],
      });
    }
  });

export type PaymentMethodForm = z.infer<typeof paymentMethodSchema>;

export interface UpdatePaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: PaymentMethodForm) => void;
  initialValues?: PaymentMethodForm;
}

const DEFAULT_VALUES: PaymentMethodForm = {
  method: "bank",
  accountHolderName: "",
  bankName: "",
  accountNumber: "",
  routingNumber: "",
  accountType: "",
  cardNumber: "",
  expiryDate: "",
  cvv: "",
};

interface MethodOption {
  value: PaymentMethodType;
  title: string;
  description: string;
  icon: React.ElementType;
}

const METHOD_OPTIONS: MethodOption[] = [
  {
    value: "bank",
    title: "Bank Account",
    description: "Direct deposit",
    icon: Building2,
  },
  {
    value: "debit",
    title: "Debit Card",
    description: "Instant transfer",
    icon: CreditCard,
  },
];

export default function UpdatePaymentMethodDialog({
  open,
  onOpenChange,
  onSave,
  initialValues,
}: UpdatePaymentMethodDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<PaymentMethodForm>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: initialValues || DEFAULT_VALUES,
  });

  const selectedMethod = watch("method");

  React.useEffect(() => {
    if (!open) {
      return;
    }

    reset(initialValues || DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  function onSubmit(data: PaymentMethodForm) {
    onSave(data);
    onOpenChange(false);
  }

  function handleMethodSelect(method: PaymentMethodType) {
    setValue("method", method, { shouldValidate: true, shouldDirty: true });
    clearErrors();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 gap-0 overflow-y-auto">
        <DialogHeader className="py-3 gap-1 px-4 border-b">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Update Payment Method
          </DialogTitle>
          <DialogDescription className="">
            Add or update your payout account
          </DialogDescription>
        </DialogHeader>

        <form className="p-5 pt-2 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register("method")} />

          <Field>
            <FieldLabel className="text-base">Payment Method Type</FieldLabel>
            <FieldContent>
              <div className="grid gap-3 grid-cols-2">
                {METHOD_OPTIONS.map((option) => {
                  const isActive = selectedMethod === option.value;
                  const Icon = option.icon;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleMethodSelect(option.value)}
                      className={cn(
                        "rounded-xl border p-3 text-left transition-colors",
                        "flex items-center gap-3",
                        isActive
                          ? "border-primary bg-primary/10"
                          : "border-input bg-background hover:bg-muted/40",
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-md p-2",
                          isActive
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground bg-muted/50",
                        )}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <p className="text-lg leading-tight font-medium">
                          {option.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel className="text-base">
              {selectedMethod === "bank"
                ? "Account Holder Name"
                : "Cardholder Name"}
            </FieldLabel>
            <FieldContent>
              <Input
                className="h-10"
                placeholder="Dr. Sarah Mitchell"
                {...register("accountHolderName")}
              />
            </FieldContent>
            <FieldError
              errors={
                errors.accountHolderName ? [errors.accountHolderName] : []
              }
            />
          </Field>

          {selectedMethod === "bank" ? (
            <>
              <Field>
                <FieldLabel className="text-base">Bank Name</FieldLabel>
                <FieldContent>
                  <Input
                    className="h-10"
                    placeholder="Bank of America"
                    {...register("bankName")}
                  />
                </FieldContent>
                <FieldError errors={errors.bankName ? [errors.bankName] : []} />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel className="text-base">Account Number</FieldLabel>
                  <FieldContent>
                    <Input
                      className="h-10"
                      placeholder="1234567890"
                      {...register("accountNumber")}
                    />
                  </FieldContent>
                  <FieldError
                    errors={errors.accountNumber ? [errors.accountNumber] : []}
                  />
                </Field>

                <Field>
                  <FieldLabel className="text-base">Routing Number</FieldLabel>
                  <FieldContent>
                    <Input
                      className="h-10"
                      placeholder="021000021"
                      {...register("routingNumber")}
                    />
                  </FieldContent>
                  <FieldError
                    errors={errors.routingNumber ? [errors.routingNumber] : []}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel className="text-base">Account Type</FieldLabel>
                <FieldContent>
                  <Input
                    className="h-10"
                    placeholder="Checking"
                    {...register("accountType")}
                  />
                </FieldContent>
                <FieldError
                  errors={errors.accountType ? [errors.accountType] : []}
                />
              </Field>
            </>
          ) : (
            <>
              <Field>
                <FieldLabel className="text-base">Card Number</FieldLabel>
                <FieldContent>
                  <Input
                    className="h-10"
                    placeholder="1234 5678 9012 3456"
                    {...register("cardNumber")}
                  />
                </FieldContent>
                <FieldError
                  errors={errors.cardNumber ? [errors.cardNumber] : []}
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel className="text-base">Expiry Date</FieldLabel>
                  <FieldContent>
                    <Input
                      className="h-10"
                      placeholder="MM/YY"
                      {...register("expiryDate")}
                    />
                  </FieldContent>
                  <FieldError
                    errors={errors.expiryDate ? [errors.expiryDate] : []}
                  />
                </Field>

                <Field>
                  <FieldLabel className="text-base">CVV</FieldLabel>
                  <FieldContent>
                    <Input
                      className="h-10"
                      placeholder="123"
                      {...register("cvv")}
                    />
                  </FieldContent>
                  <FieldError errors={errors.cvv ? [errors.cvv] : []} />
                </Field>
              </div>
            </>
          )}

          <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-900">
            <ShieldCheck className="size-5 mt-0.5 shrink-0 text-blue-700" />
            <p className="text-base leading-6">
              Your payment information is encrypted and stored securely. We
              never share your financial details with third parties.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-gradient-dash text-white">
              <Save className="size-5" />
              Save Payment Method
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
