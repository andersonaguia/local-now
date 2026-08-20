import { describeWeather } from './weather.codes';

describe('describeWeather', () => {
  it('maps known WMO codes', () => {
    expect(describeWeather(0)).toBe('Céu limpo');
    expect(describeWeather(61)).toBe('Chuva fraca');
    expect(describeWeather(95)).toBe('Trovoada');
  });

  it('returns a fallback for unknown codes', () => {
    expect(describeWeather(1234)).toBe('Indefinido');
  });
});
