import type { ThemeConfig } from 'antd';

/**
 * Inserts an alpha channel into a computed oklch(...) color string, e.g.
 * "oklch(0.95 0.006 250)" -> "oklch(0.95 0.006 250 / 65%)". Used to dim
 * the idle (non-hover, non-selected) menu item color relative to the
 * full-strength hover/selected color, without needing a second CSS var.
 */
const withAlpha = (oklchColor: string, alphaPercent: number) => {
  return oklchColor.replace(')', ` / ${alphaPercent}%)`);
};

/**
 * Reads the CSS custom properties defined in styles.css (--primary,
 * --secondary, etc.) via getComputedStyle and maps them into antd's
 * ThemeConfig tokens. This keeps antd components visually in sync with
 * the same palette Tailwind utility classes use, without duplicating hex
 * values in two places.
 *
 * getComputedStyle is read once at app startup in main.tsx, so this
 * reflects whichever mode (.dark class present or not) is active at
 * that moment - if you add a runtime theme toggle later, re-call this
 * and re-render ConfigProvider when the mode changes.
 */
export const getAntdThemeConfig = (styles: CSSStyleDeclaration) => {
  const primaryColor = styles.getPropertyValue('--primary');

  const primaryForegroundColor = styles.getPropertyValue(
    '--primary-foreground',
  );

  const secondaryColor = styles.getPropertyValue('--secondary');

  const secondaryForegroundColor = styles.getPropertyValue(
    '--secondary-foreground',
  );

  const idleItemColor = withAlpha(secondaryForegroundColor, 65);

  return {
    token: {
      colorPrimary: primaryColor,
      colorText: secondaryColor,
      colorTextBase: secondaryColor,
    },
    components: {
      Menu: {
        itemBorderRadius: 10,
        itemMarginBlock: 4,
        itemPaddingInline: 16,
        itemHeight: 44,
        itemBg: 'transparent',
        subMenuItemBg: 'transparent',
        itemColor: idleItemColor,
        itemHoverBg: 'rgba(255, 255, 255, 0.06)',
        itemHoverColor: secondaryForegroundColor,
        itemSelectedBg: 'rgba(255, 255, 255, 0.06)',
        itemSelectedColor: secondaryForegroundColor,
        itemActiveBg: 'rgba(255, 255, 255, 0.06)',
      },
      Tabs: {
        itemSelectedColor: primaryColor,
        itemColor: secondaryColor,
        itemHoverColor: primaryColor,
        itemActiveColor: primaryColor,
        inkBarColor: primaryColor,
      },
      Table: {
        headerBg: 'transparent',
        headerSplitColor: 'transparent',
        cellPaddingBlock: 12,
        cellPaddingInline: 12,
      },
      Segmented: {
        itemActiveBg: secondaryForegroundColor,
        itemHoverBg: secondaryForegroundColor,
        itemSelectedBg: primaryColor,
        itemSelectedColor: primaryForegroundColor,
      },
    },
  } satisfies ThemeConfig;
};

export default getAntdThemeConfig;
