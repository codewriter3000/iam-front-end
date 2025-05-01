const ErrorBoundary = ({ trigger, fallback, children }) => {
    if (trigger) {
      return fallback;
    } else {
      return children;
    }
};

export default ErrorBoundary;