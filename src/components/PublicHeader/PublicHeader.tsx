import {
  Header,
  HeaderContainer,
  HeaderMenuButton,
  SkipToContent,
} from "@carbon/react";

import './_public-header.scss';

const PublicHeader = () => {

  return (
    <HeaderContainer
      render={({ isSideNavExpanded, onClickSideNavExpand }) => (
        <Header aria-label="Admin Studio">
          <SkipToContent />
          <HeaderMenuButton
            aria-label="Open menu"
            onClick={onClickSideNavExpand}
            isActive={isSideNavExpanded}
          />
          <a href="/" className="cds--header__name">
            <span className="cds--header__name--prefix">CW3</span>
            &nbsp;Admin Studio
          </a>
        </Header>
      )}
    />
  );
};

export default PublicHeader;
