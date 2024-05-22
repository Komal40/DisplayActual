import React from 'react';

const withScreenSizeCheck = (WrappedComponent) => {
  class ScreenSizeCheck extends React.Component {
    componentDidMount() {
      this.checkScreenSize();
      window.addEventListener('resize', this.checkScreenSize);
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.checkScreenSize);
    }

    checkScreenSize = () => {
      const minWidth = 1024; // Minimum width for laptops
      if (window.innerWidth < minWidth) {
        // You can redirect or show a message here
        document.body.innerHTML = '<h1>Access restricted. Please use a laptop to view this website.</h1>';
      }
    };

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  return ScreenSizeCheck;
};

export default withScreenSizeCheck;