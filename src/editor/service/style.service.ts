import {Style} from '../entity/style.enum';

export class StyleService {
    public getTextStyleClassName(styles: Style[]): string {
        const textStyles = [Style.Bold, Style.Italic, Style.LargeFont, Style.SmallFont];
        return styles
            .filter(style => textStyles.indexOf(style) >= -1)
            .map(style => {
                switch (style) {
                    case Style.Bold:
                        return 'bold';
                    case Style.Italic:
                        return 'italic';
                    case Style.LargeFont:
                        return 'large-font';
                    case Style.SmallFont:
                        return 'small-font';
                    case Style.Quote:
                        return 'quote';
                    default:
                        return '';
                }
            })
            .join(' ');
    }
}