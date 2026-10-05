import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import styles from './card.module.css';

/** The heading level the card title uses. */
export type CardTitleAs = 'h2' | 'h3' | 'h4';

// The native `title` is a string (the browser tooltip); the card's title slot
// claims it here, so omit it from HTMLAttributes first to avoid a type conflict.
export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** The card title. Omit it and no title row is rendered. */
  title?: ReactNode;
  /**
   * Supporting text below the title.
   * The font size matches the body text (14/22), but it uses the secondary
   * colour `--dsw-alias-label-secondary`, so the title, the description and
   * the body read as three distinct levels at a glance.
   */
  description?: ReactNode;
  /** Which heading level the title renders as; defaults to `h3`. */
  titleAs?: CardTitleAs;
  /** The card's footer slot (action buttons, links, footnotes); a hairline separates it from the body. */
  footer?: ReactNode;
  /** The card body. */
  children?: ReactNode;
}

/** Joins class names, so no dependency such as clsx is needed. */
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Inline content card.
 *
 * Geometry is anchored to values already checked against the official source:
 * a 12px corner radius (official HoverCard `.card` / ReadBlock
 * `--dsl-read-radius`), a 0.5px stroke + `--dsw-alias-border-l1` (official
 * markdown/MarkdownText `.markdown :not(pre) > code`), a 16/24/500 title
 * (official Modal `.title`). Padding and slot gaps are proposed here, see the
 * README. The implementation is original to this repository.
 *
 * @example
 * <Card title="Conversation stats" description="Last 7 days" footer={<a href="/stats">View details</a>}>
 *   <strong>1,204</strong> messages
 * </Card>
 *
 * @example
 * <Card titleAs="h2" title="Context usage" description="86k / 200k used">
 *   <p>Close to the limit, DSH compresses the message history on its own.</p>
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
