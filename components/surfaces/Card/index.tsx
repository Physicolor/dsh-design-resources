import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import styles from './card.module.css';

/** 卡片标题使用的标题级别。 */
export type CardTitleAs = 'h2' | 'h3' | 'h4';

// 原生 `title` 是字符串（浏览器 tooltip），这里被卡片的标题插槽占用，
// 所以先从 HTMLAttributes 里摘掉再声明，避免类型冲突。
export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** 卡片标题。不传则不渲染标题行。 */
  title?: ReactNode;
  /**
   * 标题下方的补充说明。
   * 字号与正文相同（14/22），但用次级色 `--dsw-alias-label-secondary`，
   * 以便一眼区分「标题 / 说明 / 正文」三层。
   */
  description?: ReactNode;
  /** 标题渲染成哪个级别的标题，默认 `h3`。 */
  titleAs?: CardTitleAs;
  /** 卡片底部插槽（操作按钮、链接、脚注），与正文之间会加一条 hairline。 */
  footer?: ReactNode;
  /** 卡片正文。 */
  children?: ReactNode;
}

/** 拼 class，避免引入 clsx 之类的依赖。 */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * 内联内容卡片。
 *
 * 几何锚定官方已核实的数值：圆角 12px（官方 HoverCard `.card` / ReadBlock
 * `--dsl-read-radius`）、0.5px 描边 + `--dsw-alias-border-l1`（官方
 * markdown/MarkdownText `.markdown :not(pre) > code`）、标题 16/24/500（官方
 * Modal `.title`）。内边距与插槽间距为本仓库建议值，见 README。实现为本仓库原创。
 *
 * @example
 * <Card title="会话统计" description="过去 7 天" footer={<a href="/stats">查看详情</a>}>
 *   <strong>1,204</strong> 条消息
 * </Card>
 *
 * @example
 * <Card titleAs="h2" title="上下文占用" description="已用 86k / 200k">
 *   <p>接近上限时 DSH 会自动压缩历史消息。</p>
 * </Card>
 */
export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { title, description, titleAs: Title = 'h3', footer, className, children, ...rest },
  ref,
) {
  const hasHeader = title != null || description != null;

  return (
    <section {...rest} ref={ref} className={cx(styles.card, className)}>
      {hasHeader ? (
        <div className={styles.header}>
          {title != null ? <Title className={styles.title}>{title}</Title> : null}
          {description != null ? <p className={styles.description}>{description}</p> : null}
        </div>
      ) : null}
      {children != null ? <div className={styles.body}>{children}</div> : null}
      {footer != null ? <div className={styles.footer}>{footer}</div> : null}
    </section>
  );
});

export default Card;
