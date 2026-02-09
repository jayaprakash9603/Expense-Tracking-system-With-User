// TableBody.jsx (JSX file)
import React from "react";

const TableBody = ({ page, prepareRow }) => {
  return (
    <tbody>
      {page.map((row) => {
        prepareRow(row);
        return (
          <tr {...row.getRowProps()}>
            {row.cells.map((cell) => (
              <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
            ))}
          </tr>
        );
      })}
    </tbody>
  );
};

export default TableBody;
