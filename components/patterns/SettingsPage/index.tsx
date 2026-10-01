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

/** 拼 class，避免引入 clsx 之类的依赖。 */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** 语义标题级别，用于需要按页面层级降级的场景。 */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/* ------------------------------------------------------------------ 导航行 */

export interface SettingsNavItemProps extends HTMLAttributes<HTMLElement> {
  /** 是否当前所在分区。为 `true` 时带 `aria-current="page"` 与选中底色。 */
  active?: boolean;
  /** 传了 `href` 渲染成 `<a>`（页面内锚点跳转），否则渲染成 `<button>`。 */
  href?: string;
  /** 前置图标节点，会被放进 16×16 的图标容器里。 */
  icon?: ReactNode;
}

/**
 * 设置页左侧导航的一行。
 *
 * 行几何参照官方 Menu 的菜单单元（min-height 40 / padding 8px 10px /
 * radius 10px / gap 8px / 14-22），实现为本仓库原创。
 *
 * @example
 * <SettingsNavItem active icon={<IconSettings />}>通用</SettingsNavItem>
 * <SettingsNavItem href="#appearance">外观</SettingsNavItem>
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

/* ---------------------------------------------------------------- 内容分区 */

/* 这里 Omit 掉原生的 `title`（string 工具提示属性），换成 ReactNode 的标题，
   否则接口与 HTMLAttributes 的 `title?: string` 冲突。 */
export interface SettingsSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** 分区标题。不传则不渲染标题行。 */
  title?: ReactNode;
  /** 标题下方的补充说明。 */
  description?: ReactNode;
  /** 右对齐的操作区（通常是 1 个 Button）。 */
  actions?: ReactNode;
  /** 标题的语义级别，默认 2。 */
  headingLevel?: HeadingLevel;
}

/**
 * 设置页内容列里的一个分区：标题行 + 可选描述 + 内容。
 *
 * 排版参照官方 Modal 的标题/描述（16-24-500 / 14-22），实现为本仓库原创。
 * 只负责排版，不画卡片、不加背景，避免和内容里的控件抢层次。
 *
 * @example
 * <SettingsSection title="通用" description="对所有会话生效">
 *   <ListRowGroup title="启动行为">…</ListRowGroup>
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

/* ------------------------------------------------------------------ 整页骨架 */

export interface SettingsPageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** 左列导航内容，通常是若干 `SettingsNavItem`。 */
  nav: ReactNode;
  /** 导航列的无障碍名称，默认「设置分区」。 */
  navLabel?: string;
  /** 页面标题。不传则不渲染标题区。 */
  title?: ReactNode;
  /** 标题下方的说明。 */
  description?: ReactNode;
  /** 标题的语义级别，默认 1。 */
  titleLevel?: HeadingLevel;
  /**
   * 覆盖左列宽度。数字按 px 处理。
   * 默认 218px（取自官方 Menu 菜单卡外宽）。
   */
  navWidth?: number | string;
}

/**
 * 设置页整页骨架：左列分区导航 + 右列内容。
 *
 * 只做布局与排版，不 import 仓库内任何其它组件；导航项、内容全部由调用方
 * 通过 `nav` / `children` 插槽传入。
 *
 * 导航行几何参照官方 Menu 的菜单单元，内容列排版参照官方 Modal 的标题/描述，
 * 实现为本仓库原创。
 *
 * @example
 * <SettingsPage
 *   title="设置"
 *   description="以下改动会立即生效"
 *   nav={
 *     <>
 *       <SettingsNavItem active>通用</SettingsNavItem>
 *       <SettingsNavItem>外观</SettingsNavItem>
 *     </>
 *   }
 * >
 *   <SettingsSection title="通用">…</SettingsSection>
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
