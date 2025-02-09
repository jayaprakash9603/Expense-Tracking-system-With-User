// TableHeader.jsx (JSX file)
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";

const TableHeader = ({ headerGroup }) => {
  return (
    <>
      <tr {...headerGroup.getHeaderGroupProps()} className="custom-tr">
        {headerGroup.headers.map((column) => (
          <th {...column.getHeaderProps(column.getSortByToggleProps())}>
            <div>
              {column.render("Header")}
              <span>
                {column.isSorted ? (
                  column.isSortedDesc ? (
                    <FontAwesomeIcon icon={faSortDown} />
                  ) : (
                    <FontAwesomeIcon icon={faSortUp} />
                  )
                ) : (
                  <FontAwesomeIcon icon={faSort} />
                )}
              </span>
            </div>
          </th>
        ))}
      </tr>
    </>
  );
};

export default TableHeader;
