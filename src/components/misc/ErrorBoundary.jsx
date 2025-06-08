const ErrorBoundary = ({ trigger, fallback=<h1>An error has occurred</h1>, children }) => {
    if (trigger) {
      return fallback;
    } else {
      return children;
    }
};

export default ErrorBoundary;