import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Autocomplete, TextField } from "@mui/material";
import { fetchCategories } from "../../../Redux/Category/categoryActions";

const labelStyle = "text-white text-sm sm:text-base font-semibold mr-4";
const inputWrapper = {
  width: "150px",
  minWidth: "150px",
  display: "flex",
  alignItems: "center",
};

const CategoryAutocomplete = ({ value, onChange, friendId }) => {
  const dispatch = useDispatch();
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useSelector((state) => state.categories || {});

  useEffect(() => {
    dispatch(fetchCategories(friendId || ""));
  }, [dispatch, friendId]);

  const handleChange = (event, newValue) => {
    onChange(newValue ? newValue.id : "");
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label htmlFor="category" className={labelStyle} style={inputWrapper}>
          Category
        </label>
        <Autocomplete
          autoHighlight
          options={Array.isArray(categories) ? categories : []}
          getOptionLabel={(option) => option.name || ""}
          value={
            Array.isArray(categories)
              ? categories.find((cat) => cat.id === value) || null
              : null
          }
          onChange={handleChange}
          loading={categoriesLoading}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search category"
              variant="outlined"
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
          )}
          sx={{
            width: "100%",
            maxWidth: "300px",
          }}
        />
      </div>
      {categoriesError && (
        <div className="text-red-400 text-xs mt-1">
          Error loading categories
        </div>
      )}
    </div>
  );
};

export default CategoryAutocomplete;
