import { useState } from "react";

interface FormValues {
  [key: string]: string;
}

export function useFormFields(initialValues: FormValues) {
  const [values, setValues] = useState<FormValues>(initialValues);

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };


  const setFieldValue = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };


  const resetForm = () => setValues(initialValues);

  return { values, handleChange, setFieldValue, resetForm };
}
