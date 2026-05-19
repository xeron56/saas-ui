import { sanitizeRichText } from './index';

describe('sanitizeRichText', () => {
  it('keeps safe paragraph alignment and strips unsafe attributes', () => {
    const clean = sanitizeRichText(
      [
        '<p style="text-align: center; background-image: url(javascript:alert(1))" onclick="alert(1)">',
        'Hello <a href="javascript:alert(1)">bad</a>',
        '<a href="/docs">safe</a>',
        '<script>alert(1)</script>',
        '</p>',
      ].join(''),
    );

    expect(clean).toContain('style="text-align: center;"');
    expect(clean).toContain('href="/docs"');
    expect(clean).toContain('rel="noopener noreferrer"');
    expect(clean).toContain('target="_blank"');
    expect(clean).not.toContain('onclick');
    expect(clean).not.toContain('background-image');
    expect(clean).not.toContain('javascript:');
    expect(clean).not.toContain('<script');
  });

  it('normalizes legacy align attributes without preserving arbitrary styles', () => {
    const clean = sanitizeRichText(
      '<p align="right">Right</p><p style="text-align: expression(alert(1)); color: red">Bad</p>',
    );

    expect(clean).toContain('<p style="text-align: right;">Right</p>');
    expect(clean).toContain('<p>Bad</p>');
    expect(clean).not.toContain('expression');
    expect(clean).not.toContain('color: red');
  });
});
