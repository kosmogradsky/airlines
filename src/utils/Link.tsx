import * as React from 'react';
import { History, Location, createLocation, LocationDescriptor } from "history";

const isModifiedEvent = (event: React.MouseEvent<HTMLAnchorElement>) =>
  !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: LocationDescriptor;
  innerRef?: (node: HTMLAnchorElement | null) => void;
}

export const LinkContext = React.createContext<{
  history: History | undefined,
  requestUrlChange: (toLocation: Location) => void
}>({
  history: undefined,
  requestUrlChange: () => {}
})

export class Link extends React.Component<LinkProps> {
  handleClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    toLocation: Location,
    requestUrlChange: (toLocation: Location) => void
  ) {
    if (this.props.onClick) { this.props.onClick(event); }

    if (
      !event.defaultPrevented && // onClick prevented default
      event.button === 0 && // ignore everything but left clicks
      (!this.props.target || this.props.target === '_self') && // let browser handle "target=_blank" etc.
      !isModifiedEvent(event) // ignore clicks with modifier keys
    ) {
      event.preventDefault();

      requestUrlChange(toLocation);
    }
  }

  render() {
    const { innerRef, to, ...rest } = this.props;
    
    return (
      <LinkContext.Consumer>
        {({ history, requestUrlChange }) => {
          if (history === undefined) { return null; }

          const toLocation = createLocation(to);
          const href = history.createHref(toLocation);

          return (
            <a
              {...rest}
              onClick={event => this.handleClick(event, toLocation, requestUrlChange)}
              href={href}
              ref={innerRef}
            />
          );
        }}
      </LinkContext.Consumer>
    )
  }
};