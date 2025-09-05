import React from "react";

import Address from "@/components/Address/Address";
import AddressBook from "@/components/AddressBook/AddressBook";
import Button from "@/components/Button/Button";
import ErrorMessage from "@/components/ErrorMessage/ErrorMessage";
import InputText from "@/components/InputText/InputText";
import Radio from "@/components/Radio/Radio";
import Section from "@/components/Section/Section";
import useAddressBook from "@/hooks/useAddressBook";
import { useFormFields } from "@/hooks/useFormFields";
import transformAddress from "./core/models/address";

import styles from "./App.module.css";
import { Address as AddressType } from "./types";

function App() {
  /**
   * Form fields using custom hook
   */
  const { values, handleChange, resetForm } = useFormFields({
    postCode: '',
    houseNumber: '',
    firstName: '',
    lastName: ''
  });
  
  const [selectedAddress, setSelectedAddress] = React.useState("");
  /**
   * Results states
   */
  const [error, setError] = React.useState<undefined | string>(undefined);
  const [addresses, setAddresses] = React.useState<AddressType[]>([]);
  const [loading, setLoading] = React.useState(false);
  /**
   * Redux actions
   */
  const { addAddress } = useAddressBook();

  const handleSelectedAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setSelectedAddress(e.target.value);

  const handleAddressSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear previous results and errors
    setAddresses([]);
    setError(undefined);
    setSelectedAddress("");
    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_URL || window.location.origin;
      const response = await fetch(
        `${baseUrl}/api/getAddresses?postcode=${values.postCode}&streetnumber=${values.houseNumber}`
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.errormessage || 'Failed to fetch addresses');
        return;
      }
      
      if (data.status === 'ok' && data.details) {
        // Transform addresses and add houseNumber to each
        const transformedAddresses = data.details.map((address: any) => 
          transformAddress({
            ...address,
            houseNumber: values.houseNumber,
            lat: address.lat?.toString() || Date.now().toString(),
            lon: address.long?.toString() || Math.random().toString()
          })
        );
        setAddresses(transformedAddresses);
      } else {
        setError(data.errormessage || 'No addresses found');
      }
    } catch (err) {
      setError('Failed to fetch addresses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate first name and last name fields
    if (!values.firstName.trim() || !values.lastName.trim()) {
      setError("First name and last name fields mandatory!");
      return;
    }

    if (!selectedAddress || !addresses.length) {
      setError(
        "No address selected, try to select an address or find one if you haven't"
      );
      return;
    }

    const foundAddress = addresses.find(
      (address) => address.id === selectedAddress
    );

    if (!foundAddress) {
      setError("Selected address not found");
      return;
    }

    addAddress({ ...foundAddress, firstName: values.firstName, lastName: values.lastName });
  };

  return (
    <main>
      <Section>
        <h1>
          Create your own address book!
          <br />
          <small>
            Enter an address by postcode add personal info and done! 👏
          </small>
        </h1>
        {/* TODO: Create generic <Form /> component to display form rows, legend and a submit button  */}
        <form onSubmit={handleAddressSubmit}>
          <fieldset>
            <legend>🏠 Find an address</legend>
            <div className={styles.formRow}>
              <InputText
                name="postCode"
                onChange={handleChange}
                placeholder="Post Code"
                value={values.postCode}
              />
            </div>
            <div className={styles.formRow}>
              <InputText
                name="houseNumber"
                onChange={handleChange}
                value={values.houseNumber}
                placeholder="House number"
              />
            </div>
            <Button type="submit" loading={loading}>Find</Button>
          </fieldset>
        </form>
        {addresses.length > 0 &&
          addresses.map((address) => {
            return (
              <Radio
                name="selectedAddress"
                id={address.id}
                key={address.id}
                onChange={handleSelectedAddressChange}
              >
                <Address {...address} />
              </Radio>
            );
          })}
        {/* TODO: Create generic <Form /> component to display form rows, legend and a submit button  */}
        {selectedAddress && (
          <form onSubmit={handlePersonSubmit}>
            <fieldset>
              <legend>✏️ Add personal info to address</legend>
              <div className={styles.formRow}>
                <InputText
                  name="firstName"
                  placeholder="First name"
                  onChange={handleChange}
                  value={values.firstName}
                />
              </div>
              <div className={styles.formRow}>
                <InputText
                  name="lastName"
                  placeholder="Last name"
                  onChange={handleChange}
                  value={values.lastName}
                />
              </div>
              <Button type="submit">Add to addressbook</Button>
            </fieldset>
          </form>
        )}

        {error && <ErrorMessage message={error} />}

        <Button 
          variant="secondary" 
          onClick={() => {
            resetForm();
            setAddresses([]);
            setSelectedAddress("");
            setError(undefined);
          }}
        >
          Clear all fields
        </Button>
      </Section>

      <Section variant="dark">
        <AddressBook />
      </Section>
    </main>
  );
}

export default App;
