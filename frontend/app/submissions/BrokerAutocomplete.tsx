'use client';

import { useEffect, useRef, useState } from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';

import { useBrokerOptions } from '@/lib/hooks/useBrokerOptions';
import { Broker } from '@/lib/types';

interface Props {
  value: string;
  onChange: (brokerId: string) => void;
}

// Server-side searched autocomplete — fetches only brokers matching the typed query
// so the list never bloats as broker count grows.
// TODO (Ali): add react-window ListboxComponent for DOM-level virtualization before final submission.
export function BrokerAutocomplete({ value, onChange }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const inputRef = useRef(inputValue);
  inputRef.current = inputValue;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(inputRef.current), 400);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const { data: brokers = [], isFetching } = useBrokerOptions(debouncedSearch);

  const selected = brokers.find((b) => String(b.id) === value) ?? null;

  return (
    <Autocomplete<Broker>
      options={brokers}
      value={selected}
      inputValue={inputValue}
      onInputChange={(_, newInput) => setInputValue(newInput)}
      onChange={(_, broker) => onChange(broker ? String(broker.id) : '')}
      getOptionLabel={(broker) => broker.name}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      filterOptions={(x) => x}
      loading={isFetching}
      fullWidth
      renderInput={(params) => (
        <TextField
          {...params}
          label="Broker"
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {isFetching && <CircularProgress color="inherit" size={16} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
