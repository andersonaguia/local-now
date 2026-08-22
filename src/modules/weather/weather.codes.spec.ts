import { describeWeather } from './weather.codes';

describe('describeWeather', () => {
  it('should be able to map known WMO codes', () => {
    expect(describeWeather(0)).toBe('Céu limpo');
    expect(describeWeather(61)).toBe('Chuva fraca');
    expect(describeWeather(95)).toBe('Trovoada');
  });

  it('should be able to return a fallback for unknown codes', () => {
    expect(describeWeather(1234)).toBe('Indefinido');
  });
});
