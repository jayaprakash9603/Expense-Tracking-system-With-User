import React from "react";
import { Autocomplete, TextField } from "@mui/material";

const labelStyle = "text-white text-sm sm:text-base font-semibold mr-4";
const inputWrapper = {
  width: "150px",
  minWidth: "150px",
  display: "flex",
  alignItems: "center",
};

const TypeAutocomplete = ({ value, onChange, error, onErrorClear }) => {
  const typeOptions = ["gain", "loss"];

  const handleTypeChange = (event, newValue) => {
    const newType = newValue || "loss";
    onChange(newType);

    if (error && onErrorClear) {
      onErrorClear();
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label htmlFor="type" className={labelStyle} style={inputWrapper}>
          Type<span className="text-red-500"> *</span>
        </label>
        <Autocomplete
          autoHighlight
          options={typeOptions}
          getOptionLabel={(option) =>
            option.charAt(0).toUpperCase() + option.slice(1)
          }
          value={value || ""}
          onChange={handleTypeChange}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Select type"
              variant="outlined"
              error={error}
              sx={{
                "& .MuiInputBase-root": {
                  backgroundColor: "#29282b",
                  color: "#fff",
                  height: "56px",
                  fontSize: "16px",
                },
                "& .MuiInputBase-input": {
                  color: "#fff",
                  "&::placeholder": {
                    color: "#9ca3af",
                    opacity: 1,
                  },
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: error ? "#ff4d4f" : "rgb(75, 85, 99)",
                    borderWidth: "1px",
                  },
                  "&:hover fieldset": {
                    borderColor: error ? "#ff4d4f" : "rgb(75, 85, 99)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: error ? "#ff4d4f" : "#00dac6",
                    borderWidth: "2px",
                  },
                },
              }}
            />
          )}
          sx={{
            width: "100%",
            maxWidth: "300px",
          }}
        />
      </div>
    </div>
  );
};

export default TypeAutocomplete;
