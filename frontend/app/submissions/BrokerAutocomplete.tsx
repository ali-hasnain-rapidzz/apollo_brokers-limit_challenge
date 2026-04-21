'use client';

import { useEffect, useMemo, useState } from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';

import { useBrokerById, useBrokerOptions } from '@/lib/hooks/useBrokerOptions';
import { Broker } from '@/lib/types';

interface Props {
  value: string;
  onChange: (brokerId: string) => void;
}

export function BrokerAutocomplete({ value, onChange }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(inputValue), 400);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const { data: searchResults = [], isFetching } = useBrokerOptions(debouncedSearch);
  const { data: brokerById } = useBrokerById(value);

  const options = useMemo<Broker[]>(() => {
    if (!brokerById) return searchResults;
    const alreadyInResults = searchResults.some((b) => String(b.id) === value);
    return alreadyInResults ? searchResults : [brokerById, ...searchResults];
  }, [searchResults, brokerById, value]);

  const selected = options.find((b) => String(b.id) === value) ?? null;

  return (
    <Autocomplete<Broker>
      options={options}
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
          placeholder="Search brokers…"
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
