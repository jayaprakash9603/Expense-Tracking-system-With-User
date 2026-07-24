import React from "react";
import PropTypes from "prop-types";
import NoDataPlaceholder from "./NoDataPlaceholder";

const EmptyStateCard = ({
  icon = "inbox",
  title = "No data",
  message = "Nothing to display yet.",
  height = 220,
  bordered = true,
}) => (
  <NoDataPlaceholder
    message={title}
    subMessage={message}
    height={height}
    iconKey={icon}
    size="lg"
    fullWidth
    bordered={bordered}
    variant={bordered ? "outlined" : "elevated"}
  />
);

EmptyStateCard.propTypes = {
  icon: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
    PropTypes.func,
  ]),
  title: PropTypes.string,
  message: PropTypes.string,
  height: PropTypes.number,
  bordered: PropTypes.bool,
};

export default EmptyStateCard;
