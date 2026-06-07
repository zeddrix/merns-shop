interface PasswordStrengthHintsProps {
  password: string;
}

const checks = [
  { id: 'length', label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (value: string) => /[A-Z]/.test(value) },
  { id: 'lower', label: 'One lowercase letter', test: (value: string) => /[a-z]/.test(value) },
  { id: 'digit', label: 'One number', test: (value: string) => /[0-9]/.test(value) },
  {
    id: 'special',
    label: 'One special character',
    test: (value: string) => /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(value)
  }
] as const;

const PasswordStrengthHints = ({ password }: PasswordStrengthHintsProps) => {
  if (!password) {
    return null;
  }

  return (
    <ul className="password-strength-hints" data-testid="password-strength-hints">
      {checks.map((check) => {
        const met = check.test(password);
        return (
          <li
            key={check.id}
            data-testid={`password-hint-${check.id}`}
            className={met ? 'password-strength-hints__met' : 'password-strength-hints__unmet'}
          >
            {check.label}
          </li>
        );
      })}
    </ul>
  );
};

export default PasswordStrengthHints;
