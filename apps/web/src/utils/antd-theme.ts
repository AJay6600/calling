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
  const foregroundColor = styles.getPropertyValue('--foreground');
  const surface2Color = styles.getPropertyValue('--surface-2');
  const borderColor = styles.getPropertyValue('--border');
  const mutedForegroundColor = styles.getPropertyValue('--muted-foreground');
  const errorColor = styles.getPropertyValue('--color-error');
  const popoverColor = styles.getPropertyValue('--popover');

  const idleItemColor = withAlpha(secondaryForegroundColor, 65);

  // Shared control radius for Select and Input, so both fields stay
  // visually consistent (pulled from --radius, e.g. "0.875rem").
  // Converted to px since antd tokens expect a number.
  const radiusRem = parseFloat(styles.getPropertyValue('--radius')) || 0.875;
  const controlRadius = radiusRem * 16;

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
        itemColor: mutedForegroundColor,
        itemHoverColor: foregroundColor,
        itemActiveColor: primaryColor,
        inkBarColor: primaryColor,
        fontSize: 15,
        titleFontSizeLG: 16,
        horizontalItemGutter: 32,
        horizontalItemPadding: '12px 0',
        cardBg: 'transparent',
        colorBorderSecondary: borderColor,
      },
      Table: {
        headerBg: 'transparent',
        headerSplitColor: 'transparent',
        headerColor: mutedForegroundColor,
        cellPaddingBlock: 16,
        cellPaddingInline: 16,
        colorBgContainer: 'transparent',
        rowHoverBg: 'rgba(255, 255, 255, 0.03)',
        borderColor: borderColor,
        colorBgElevated: popoverColor,
        filterDropdownBg: popoverColor,
        filterDropdownMenuBg: popoverColor,
      },
      Pagination: {
        itemActiveBg: 'transparent',
        itemBg: 'transparent',
        colorPrimary: primaryColor,
        colorPrimaryHover: primaryColor,
        itemSize: 32,
        borderRadius: 999,
      },
      Tag: {
        defaultBg: 'transparent',
        defaultColor: foregroundColor,
      },
      Segmented: {
        itemActiveBg: secondaryForegroundColor,
        itemHoverBg: secondaryForegroundColor,
        itemSelectedBg: primaryColor,
        itemSelectedColor: primaryForegroundColor,
      },
      Select: {
        borderRadius: controlRadius,
        controlHeight: 44,
        controlPaddingHorizontal: 18,
        fontSize: 15,
        colorBgContainer: surface2Color,
        colorBgElevated: popoverColor,
        colorBorder: borderColor,
        colorText: foregroundColor,
        colorTextPlaceholder: mutedForegroundColor,
        colorTextQuaternary: mutedForegroundColor,
        colorIcon: mutedForegroundColor,
        colorIconHover: foregroundColor,
        colorPrimary: primaryColor,
        colorPrimaryHover: primaryColor,
        colorPrimaryActive: primaryColor,
        colorHighlight: primaryColor,
        controlOutline: 'rgba(0, 195, 145, 0.15)',
        controlOutlineWidth: 2,
        optionSelectedBg: 'rgba(0, 195, 145, 0.15)',
        optionSelectedColor: primaryColor,
        optionSelectedFontWeight: 600,
        optionActiveBg: 'rgba(255, 255, 255, 0.06)',
        colorErrorBorder: errorColor,
        colorErrorOutline: 'rgba(233, 58, 78, 0.15)',
      },
      Input: {
        borderRadius: controlRadius,
        borderRadiusLG: controlRadius,
        controlHeight: 44,
        paddingInline: 18,
        paddingBlock: 8,
        fontSize: 15,
        lineHeight: 1.5,
        colorBgContainer: surface2Color,
        colorBorder: borderColor,
        colorText: foregroundColor,
        colorTextPlaceholder: mutedForegroundColor,
        colorIcon: mutedForegroundColor,
        colorIconHover: foregroundColor,
        colorPrimary: primaryColor,
        colorPrimaryHover: primaryColor,
        colorPrimaryActive: primaryColor,
        colorErrorBorder: errorColor,
        activeShadow: '0 0 0 2px rgba(0, 195, 145, 0.15)',
        errorActiveShadow: '0 0 0 2px rgba(233, 58, 78, 0.15)',
      },
    },
  } satisfies ThemeConfig;
};

export default getAntdThemeConfig;
