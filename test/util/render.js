/**
 * Taken from react-youtube's tests at
 * https://github.com/troybetz/react-youtube
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import env from 'min-react-env';
import createYouTube from './createYouTube';

Object.assign(global, env);

async function render(initialProps) {
  const { YouTube, sdkMock, playerMock } = createYouTube();

  let resolveReady;
  const readyPromise = new Promise((resolve) => {
    resolveReady = resolve;
  });

  // Emulate changes to component.props using a container component's state
  class Container extends React.Component {
    constructor(ytProps) {
      super(ytProps);

      this.state = { props: ytProps };
    }

    render() {
      const { props } = this.state;

      const onReady = (event) => {
        resolveReady();
        props.onReady?.(event);
      };

      return (
        <YouTube
          {...props}
          onReady={onReady}
        />
      );
    }
  }

  const div = env.document.createElement('div');
  const container = new Promise((resolve) => {
    if (ReactDOM.version.startsWith('18')) {
      ReactDOM.createRoot(div).render(<Container {...initialProps} ref={resolve} />);
    } else {
      ReactDOM.render(<Container {...initialProps} ref={resolve} />, div);
    }
  });
  await readyPromise;

  async function rerender(newProps) {
    const wrapper = await container;

    act(() => {
      wrapper.setState({ props: newProps });
    });
  }

  function unmount() {
    ReactDOM.unmountComponentAtNode(div);
  }

  return {
    sdkMock,
    playerMock,
    rerender,
    unmount,
  };
}

export default render;
