import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BottomBar, { BtnPrimary, BtnSecondary } from '@/components/BottomBar'

vi.mock('next/image', () => ({
  default: ({ alt, src, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} {...props} />
  ),
}))

const audioManagerMock = vi.hoisted(() => ({
  getMuted: vi.fn(() => false),
  setMuted: vi.fn(),
}))

vi.mock('@/lib/audio/manager', () => audioManagerMock)

describe('BottomBar', () => {
  beforeEach(() => {
    audioManagerMock.getMuted.mockReturnValue(false)
    audioManagerMock.setMuted.mockReset()
    window.localStorage.clear()
  })

  it('renders the stitched background and png icons for buttons', () => {
    render(
      <BottomBar
        left={<BtnSecondary onClick={() => undefined} label="Voltar" iconSrc="/icons/btn_voltar.png" />}
        center={<BtnPrimary onClick={() => undefined} label="Criar sala" iconSrc="/icons/grupo.png" />}
      />,
    )

    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveStyle({ backgroundImage: 'url(/ui/barra_fundo.png)' })

    expect(screen.getByAltText('Voltar')).toHaveAttribute('src', '/icons/btn_voltar.png')
    expect(screen.getByAltText('Criar sala')).toHaveAttribute('src', '/icons/grupo.png')
  })

  it('toggles sound state using stitched png icons', async () => {
    const user = userEvent.setup()

    render(<BottomBar />)

    expect(screen.getByAltText('Som ligado')).toHaveAttribute('src', '/icons/btn_som_on.png')

    await user.click(screen.getByRole('button', { name: 'Silenciar' }))

    expect(audioManagerMock.setMuted).toHaveBeenCalledWith(true)
    expect(window.localStorage.getItem('audio_muted')).toBe('1')
    expect(screen.getByAltText('Som desligado')).toHaveAttribute('src', '/icons/btn_som_off.png')
  })
})
