import { IProvider } from './IProvider';
import { ValidationError } from '@errors/index';
import { youtubeProvider } from './youtube/youtube.provider';

export class ProviderRegistry {
  private providers: IProvider[] = [];

  register(provider: IProvider): void {
    if (this.providers.some((p) => p.name === provider.name)) {
      throw new Error(`Provider '${provider.name}' is already registered`);
    }
    this.providers.push(provider);
  }

  getProviders(): IProvider[] {
    return [...this.providers];
  }

  findProvider(url: string): IProvider | null {
    for (const provider of this.providers) {
      if (provider.canHandle(url)) {
        return provider;
      }
    }
    return null;
  }

  getProviderByName(name: string): IProvider | null {
    return this.providers.find((p) => p.name === name) || null;
  }

  async getVideoInfo(url: string) {
    const provider = this.findProvider(url);
    if (!provider) {
      throw new ValidationError('Video platform not supported');
    }
    return provider.getVideoInfo(url);
  }

  async download(url: string, options: any) {
    const provider = this.findProvider(url);
    if (!provider) {
      throw new ValidationError('Video platform not supported');
    }
    return provider.download(url, options);
  }
}

export const providerRegistry = new ProviderRegistry();


// Register providers
providerRegistry.register(youtubeProvider);