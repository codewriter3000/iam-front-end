import { useState, useEffect } from "react";
import {
  Header,
  HeaderContainer,
  HeaderPanel,
  HeaderName,
  HeaderNavigation,
  HeaderMenuButton,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
  SideNav,
  SideNavItems,
  HeaderSideNavItems,
} from "@carbon/react";
import { Switcher, Notification, UserAvatar } from "@carbon/icons-react";
import { getSessionUser, logoutUser } from "@/../lib";

const AppHeader = () => {
  const [isClient, setIsClient] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [username, setUsername] = useState("Unknown user");

  useEffect(() => {
    setIsClient(true); // Ensure this component is rendered only on the client

    getSessionUser()
      .then((user) => {
        if (user?.username) {
          setUsername(user.username);
        }
      })
      .catch(() => {
        setUsername("Unknown user");
      });
  }, []);

  const onLogout = async () => {
    try {
      await logoutUser();
    } finally {
      window.location.href = "/login";
    }
  };

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
          <HeaderNavigation aria-label="Admin Studio">
            <HeaderMenuItem href="/users">Users</HeaderMenuItem>
            <HeaderMenuItem href="/roles">Roles</HeaderMenuItem>
            <HeaderMenuItem href="/permissions">Permissions</HeaderMenuItem>
          </HeaderNavigation>

          {isClient && (
            <SideNav
              aria-label="Side navigation"
              expanded={isSideNavExpanded}
              isPersistent={false}
            >
              <SideNavItems>
                <HeaderSideNavItems>
                  <HeaderMenuItem href="/users">Users</HeaderMenuItem>
                  <HeaderMenuItem href="/roles">Roles</HeaderMenuItem>
                  <HeaderMenuItem href="/permissions">
                    Permissions
                  </HeaderMenuItem>
                </HeaderSideNavItems>
              </SideNavItems>
            </SideNav>
          )}

          <HeaderGlobalBar>
            <HeaderGlobalAction
              aria-label="Notifications"
              tooltipAlignment="center"
              className="action-icons"
            >
              <Notification size={20} />
            </HeaderGlobalAction>
            <HeaderGlobalAction
              aria-label="User Avatar"
              tooltipAlignment="center"
              className="action-icons"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
            >
              <UserAvatar size={20} />
            </HeaderGlobalAction>
            <HeaderPanel expanded={isUserMenuOpen} aria-label="User menu">
              <div className="p-4">
                <p className="mb-3 text-sm">Signed in as</p>
                <p className="mb-4 font-semibold">{username}</p>
                <button
                  type="button"
                  onClick={onLogout}
                  className="cds--btn cds--btn--primary"
                >
                  Logout
                </button>
              </div>
            </HeaderPanel>
            <HeaderGlobalAction
              aria-label="App Switcher"
              tooltipAlignment="end"
            >
              <Switcher size={20} />
            </HeaderGlobalAction>
          </HeaderGlobalBar>
        </Header>
      )}
    />
  );
};

export default AppHeader;
