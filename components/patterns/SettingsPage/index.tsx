import {
  forwardRef,
  useId,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import styles from './settings-page.module.css';

/** Join classes without pulling in a dependency like clsx. */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Semantic heading level, for cases that need to step down with the page hierarchy. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/* ------------------------------------------------------------------ nav row */

export interface SettingsNavItemProps extends HTMLAttributes<HTMLElement> {
  /** Whether this is the current section. When `true` it carries `aria-current="page"` and the selected background. */
  active?: boolean;
  /** Renders as an `<a>` when `href` is given (an in-page anchor jump), otherwise as a `<button>`. */
  href?: string;
  /** Leading icon node, placed inside a 16×16 icon container. */
  icon?: ReactNode;
}

/**
 * One row of the settings page's left navigation.
 *
 * The row geometry follows the official Menu's menu item (min-height 40 / padding 8px 10px /
 * radius 10px / gap 8px / 14-22); the implementation is original to this repository.
 *
 * @example
 * <SettingsNavItem active icon={<IconSettings />}>General</SettingsNavItem>
 * <SettingsNavItem href="#appearance">Appearance</SettingsNavItem>
 */
export const SettingsNavItem = forwardRef<HTMLElement, SettingsNavItemProps>(function SettingsNavItem(
  { active = false, href, icon, className, children, ...rest },
  ref,
) {
  const cls = cx(styles.navItem, active && styles.navItemActive, className);
  const body = (
    <>
      {icon != null ? <span className={styles.navItemIcon}>{icon}</span> : null}
      <span className={styles.navItemLabel}>{children}</span>
    </>
  );

  if (href != null) {
    return (
      <a
        {...rest}
        ref={ref as Ref<HTMLAnchorElement>}
        href={href}
        className={cls}
        aria-current={active ? 'page' : undefined}
      >
        {body}
      </a>
    );
  }

  return (
    <button
      {...rest}
      ref={ref as Ref<HTMLButtonElement>}
      type="button"
      className={cls}
      aria-current={active ? 'page' : undefined}
    >
      {body}
    </button>
  );
});

/* ---------------------------------------------------------------- content section */

/* The native `title` (the string tooltip attribute) is omitted here and replaced by a ReactNode
   title, otherwise the interface clashes with HTMLAttributes' `title?: string`. */
export interface SettingsSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Section title. No title row is rendered when it is omitted. */
  title?: ReactNode;
  /** Supplementary text below the title. */
  description?: ReactNode;
  /** The right-aligned action area (usually one Button). */
  actions?: ReactNode;
  /** Semantic level of the heading, 2 by default. */
  headingLevel?: HeadingLevel;
}

/**
 * A section in the settings page's content column: a title row + an optional description + content.
 *
 * The typography follows the official Modal's title/description (16-24-500 / 14-22); the
 * implementation is original to this repository. It only handles typography and draws no card and
 * no background, so it does not compete for elevation with the controls inside.
 *
 * @example
 * <SettingsSection title="General" description="Applies to every conversation">
 *   <ListRowGroup title="Startup behaviour">…</ListRowGroup>
 * </SettingsSection>
 */
export const SettingsSection = forwardRef<HTMLElement, SettingsSectionProps>(function SettingsSection(
  { title, description, actions, headingLevel = 2, className, children, ...rest },
  ref,
) {
  const headingId = useId();
  const Heading = `h${headingLevel}` as ElementType;

  return (
    <section {...rest} ref={ref} className={cx(styles.section, className)} aria-labelledby={title != null ? headingId : undefined}>
      {title != null ? (
        <div className={styles.sectionHeader}>
          <Heading id={headingId} className={styles.sectionTitle}>
            {title}
          </Heading>
          {actions != null ? <div className={styles.sectionActions}>{actions}</div> : null}
        </div>
      ) : null}
      {description != null ? <p className={styles.sectionDescription}>{description}</p> : null}
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
});

/* ------------------------------------------------------------------ full-page skeleton */

export interface SettingsPageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** The left column's navigation content, usually several `SettingsNavItem`s. */
  nav: ReactNode;
  /** The navigation column's accessible name; defaults to the "settings section" label. */
  navLabel?: string;
  /** Page title. No title area is rendered when it is omitted. */
  title?: ReactNode;
  /** Text below the title. */
  description?: ReactNode;
  /** Semantic level of the heading, 1 by default. */
  titleLevel?: HeadingLevel;
  /**
   * Overrides the left column's width. Numbers are treated as px.
   * Defaults to 218px (taken from the official Menu menu card's outer width).
   */
  navWidth?: number | string;
}

/**
 * The settings page's full-page skeleton: section navigation in the left column + content in the right.
 *
 * It only does layout and typography and imports no other component from the repository; the nav
 * items and content all come in from the caller through the `nav` / `children` slots.
 *
 * The nav row geometry follows the official Menu's menu item, and the content column typography
 * follows the official Modal's title/description; the implementation is original to this repository.
 *
 * @example
 * <SettingsPage
 *   title="Settings"
 *   description="These changes take effect immediately"
 *   nav={
 *     <>
 *       <SettingsNavItem active>General</SettingsNavItem>
 *       <SettingsNavItem>Appearance</SettingsNavItem>
 *     </>
 *   }
 * >
 *   <SettingsSection title="General">…</SettingsSection>
 * </SettingsPage>
 */
export const SettingsPage = forwardRef<HTMLDivElement, SettingsPageProps>(function SettingsPage(
  { nav, navLabel = '设置分区', title, description, titleLevel = 1, navWidth, className, style, children, ...rest },
  ref,
) {
  const Title = `h${titleLevel}` as ElementType;
  const widthVars = (
    navWidth != null
      ? { '--dsh-settings-nav-width': typeof navWidth === 'number' ? `${navWidth}px` : navWidth }
      : undefined
  ) as CSSProperties | undefined;
  const mergedStyle = widthVars ? { ...style, ...widthVars } : style;

  return (
    <div {...rest} ref={ref} className={cx(styles.page, className)} style={mergedStyle}>
      <nav className={styles.nav} aria-label={navLabel}>
        <div className={styles.navInner}>{nav}</div>
      </nav>
      <div className={styles.content}>
        {title != null ? <Title className={styles.pageTitle}>{title}</Title> : null}
        {description != null ? <p className={styles.pageDescription}>{description}</p> : null}
        <div className={styles.contentBody}>{children}</div>
      </div>
    </div>
  );
});

export default SettingsPage;
