import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import styles from './sectionheader.module.css';

/** 区块标题使用的标题级别。 */
export type SectionHeaderTitleAs = 'h2' | 'h3' | 'h4';

// 原生 `title` 是字符串（浏览器 tooltip），这里被区块标题占用，
// 所以先从 HTMLAttributes 里摘掉再声明，避免类型冲突。
export interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** 区块标题，建议一句话说清这一组设置是什么。 */
  title: ReactNode;
  /** 标题下方的一句话补充说明，13/20 三级色。 */
  description?: ReactNode;
  /** 标题渲染成哪个级别的标题，默认 `h2`（页面标题 h1 → 区块 h2）。 */
  titleAs?: SectionHeaderTitleAs;
}

/** 拼 class，避免引入 clsx 之类的依赖。 */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * 设置页区块表头：标题 + 可选副标题 + 一条底部 hairline。
 *
 * 几何锚定官方已核实的数值：副标题 `font: var(--dsw-font-xs-13)`（官方
 * ReadBlock `.count` / `.copyButton` 的用法）、hairline `0.5px` +
 * `var(--dsw-alias-border-l2)`（官方 markdown/MarkdownText `.markdown hr`、
 * Menu `.footer`）。标题 18px/600 未能在可读官方源中核实，按任务书给定并标注为
 * 本仓库建议值（理由见 README）。实现为本仓库原创。
 *
 * @example
 * <SectionHeader title="模型" description="选择 DSH 默认使用的模型与推理强度" />
 *
 * @example
 * <SectionHeader titleAs="h3" title="上下文" description="历史消息如何被压缩" />
 */
export const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(function SectionHeader(
  { title, description, titleAs: Title = 'h2', className, ...rest },
  ref,
) {
  return (
    <div {...rest} ref={ref} className={cx(styles.sectionHeader, className)}>
      <Title className={styles.title}>{title}</Title>
      {description != null ? <p className={styles.description}>{description}</p> : null}
    </div>
  );
});

export default SectionHeader;
