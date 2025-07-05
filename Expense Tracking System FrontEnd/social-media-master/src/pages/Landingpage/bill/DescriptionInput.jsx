import React from "react";
import { TextField } from "@mui/material";

const labelStyle = "text-white text-sm sm:text-base font-semibold mr-4";
const inputWrapper = {
  width: "150px",
  minWidth: "150px",
  display: "flex",
  alignItems: "center",
};

const DescriptionInput = ({ value, onChange }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label
          htmlFor="description"
          className={labelStyle}
          style={inputWrapper}
        >
          Description
        </label>
        <TextField
          id="description"
          name="description"
          value={value}
          onChange={handleChange}
          placeholder="Enter description"
          variant="outlined"
          multiline
          rows={1}
          sx={{
            width: "100%",
            maxWidth: "300px",
            "& .MuiInputBase-root": {
              backgroundColor: "#29282b",
              color: "#fff",
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
                borderColor: "rgb(75, 85, 99)",
                borderWidth: "1px",
              },
              "&:hover fieldset": {
                borderColor: "rgb(75, 85, 99)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#00dac6",
                borderWidth: "2px",
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default DescriptionInput;
