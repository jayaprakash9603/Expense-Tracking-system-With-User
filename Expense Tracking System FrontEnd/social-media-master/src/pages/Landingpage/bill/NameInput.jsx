import React from "react";
import { TextField } from "@mui/material";

const labelStyle = "text-white text-sm sm:text-base font-semibold mr-4";
const inputWrapper = {
  width: "150px",
  minWidth: "150px",
  display: "flex",
  alignItems: "center",
};

const NameInput = ({ value, onChange, error, onErrorClear }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
    if (error && onErrorClear) {
      onErrorClear();
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label htmlFor="name" className={labelStyle} style={inputWrapper}>
          Name<span className="text-red-500"> *</span>
        </label>
        <TextField
          id="name"
          name="name"
          value={value}
          onChange={handleChange}
          placeholder="Enter name"
          variant="outlined"
          error={error}
          sx={{
            width: "100%",
            maxWidth: "300px",
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
      </div>
    </div>
  );
};

export default NameInput;
