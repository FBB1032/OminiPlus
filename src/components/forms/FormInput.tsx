import React, { memo } from 'react';
import { Controller, Control, FieldValues, Path, FieldError } from 'react-hook-form';
import { Input } from '../ui/Input';
import { TextInputProps } from 'react-native';

interface FormInputProps<T extends FieldValues> extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  isPassword?: boolean;
  leftIcon?: React.ComponentProps<typeof Input>['leftIcon'];
  rightIcon?: React.ComponentProps<typeof Input>['rightIcon'];
  error?: FieldError;
  hint?: string;
}

export const FormInput = memo(<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  isPassword,
  leftIcon,
  rightIcon,
  error,
  hint,
  ...rest
}: FormInputProps<T>) => (
  <Controller
    control={control}
    name={name}
    render={({ field: { onChange, onBlur, value } }) => (
      <Input
        label={label}
        placeholder={placeholder}
        value={value ?? ''}
        onChangeText={onChange}
        onBlur={onBlur}
        isPassword={isPassword}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        error={error?.message}
        hint={hint}
        {...rest}
      />
    )}
  />
)) as <T extends FieldValues>(props: FormInputProps<T>) => React.ReactElement;

(FormInput as React.FC).displayName = 'FormInput';
