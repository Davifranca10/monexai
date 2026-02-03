"use client"

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Wallet, BarChart3, Repeat, Bot, Shield, Sparkles,
  ArrowRight, CheckCircle2 
} from 'lucide-react';
import { useEffect } from 'react';

const features = [
  {
    icon: Wallet,
    title: 'Lançamentos Manuais',
    description: 'Registre receitas e despesas de forma simples e organizada',
  },
  {
    icon: Repeat,
    title: 'Recorrências Automáticas',
    description: 'Configure pagamentos recorrentes e parcelados',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Intuitivo',
    description: 'Visualize suas finanças com gráficos e relatórios',
  },
  {
    icon: Bot,
    title: 'Chat com IA',
    description: 'Tire dúvidas sobre suas finanças com inteligência artificial',
  },
  {
    icon: Shield,
    title: 'Segurança Total',
    description: 'Seus dados protegidos com criptografia e LGPD',
  },
  {
    icon: Sparkles,
    title: 'Templates Inteligentes',
    description: 'Use templates prontos ou crie os seus (Pro)',
  },
];

export default function HomePage() {

useEffect(() => {
  let smoother: any;

  (async () => {
    const gsap = (await import('gsap')).default;
    const ScrollTrigger = (await import('gsap/ScrollTrigger')).default;
    const ScrollSmoother = (await import('gsap/ScrollSmoother')).default;

    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    smoother = ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 1.2,
      smoothTouch: 0.1,
      effects: true,
      normalizeScroll: true
    });

    // 🔥 LOREM IPSUM ANIMATION
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.lorem-text-1',
        start: 'top 80%',
        end: 'top 20%',
        scrub: true
      }
    });

    tl.fromTo(
      '.lorem-text-1',
      {
        y: 100,
        opacity: 0,
        filter: 'blur(8px)'
      },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        ease: 'none'
      }
    ).to(
      '.lorem-text-1',
      {
        duration: 0.5,
        ease: 'none'
      }
    ).to(
      '.lorem-text-1',
      {
        y: -100,
        opacity: 0,
        filter: 'blur(8px)',
        ease: 'none'
      }
    );

    // Animation for lorem-text-2
    const tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: '.lorem-text-2',
        start: 'top 80%',
        end: 'top 20%',
        scrub: true
      }
    });

    tl2.fromTo(
      '.lorem-text-2',
      {
        y: 100,
        opacity: 0,
        filter: 'blur(8px)'
      },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        ease: 'none'
      }
    ).to(
      '.lorem-text-2',
      {
        duration: 0.5,
        ease: 'none'
      }
    ).to(
      '.lorem-text-2',
      {
        y: -100,
        opacity: 0,
        filter: 'blur(8px)',
        ease: 'none'
      }
    );

    // Animation for lorem-text-3
    const tl3 = gsap.timeline({
      scrollTrigger: {
        trigger: '.lorem-text-3',
        start: 'top 80%',
        end: 'top 20%',
        scrub: true
      }
    });

    tl3.fromTo(
      '.lorem-text-3',
      {
        y: 100,
        opacity: 0,
        filter: 'blur(8px)'
      },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        ease: 'none'
      }
    ).to(
      '.lorem-text-3',
      {
        duration: 0.5,
        ease: 'none'
      }
    ).to(
      '.lorem-text-3',
      {
        y: -100,
        opacity: 0,
        filter: 'blur(8px)',
        ease: 'none'
      }
    );
  })();

  return () => smoother?.kill();
}, []);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image

              src="/Logo.png"
              alt="MonexAI"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="font-bold text-xl text-green-800">MonexAI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/precos" className="text-gray-600 hover:text-green-700">
              Preços
            </Link>
            <Link href="/faq" className="text-gray-600 hover:text-green-700">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button className="bg-green-700 hover:bg-green-800">
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="mb-6">
          <span className="inline-block px-4 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Gestão Financeira Simplificada
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Controle suas finanças com{' '}
          <span className="text-green-600">inteligência</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Organize receitas, despesas e recorrências de forma manual e segura.
          Sem integração bancária, total privacidade.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/cadastro">
            <Button size="lg" className="bg-green-700 hover:bg-green-800 w-full sm:w-auto">
              Começar Grátis <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/precos">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Ver Planos
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Tudo que você precisa para organizar suas finanças
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <feature.icon className="h-10 w-10 text-green-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      
      {/* cool looking stuff */}
      <section className='w-full h-[180vh] overflow-hidden relative '>


<video
  data-speed="0.5"
  className="
    w-[1920px] h-[1620px] 
    blur-[2px] md:blur-0
    brightness-[1.1]
    md:brightness-[1]
  "
  muted
  autoPlay
  loop
  playsInline
>
  <source src="/output.mp4" media="(max-width: 768px)" />
  <source src="/backgroundVideo.mp4" media="(min-width: 769px)" />
</video>

        <h2 className="lorem-text-1 z-10 absolute top-[30%] left-[10%] text-5xl font-bold text-green-600 max-md:text-[32px] max-md:text-center max-md:left-[0%] max-md:w-[100%]">
          GESTÃO FINANCEIRA <br></br> SEM COMPLICAÇÃO,
        </h2>

        <h2 className="lorem-text-2 z-10 absolute top-[50%] left-[10%] text-5xl font-bold  text-green-600 max-md:text-[32px] max-md:text-center max-md:left-[0%] max-md:w-[100%]">
          COM SEGURANÇA<br></br>E PRATICIDADE.
        </h2>

        <h2 className="lorem-text-3 z-10 absolute top-[70%] left-[10%] text-5xl font-bold  text-green-600 max-md:text-[32px] max-md:text-center max-md:left-[0%] max-md:w-[100%]">
        SUAS FINANCIAS, <br></br> EM UM SÓ LUGAR.
        </h2>
      </section>

      {/* based pricing preview */}
      <section className='h-[120vh] w-full bg-[#060606] relative'>
        <div className='bg-[#121212] relative top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] w-[390px] h-[478px] pl-10 pr-10 pt-14' data-speed="0.9">
          <div>
            <h3 className='text-white text-[16px] font-bold'>premium</h3>
            <h2 className='text-[#00F059] tracking-[-1px] font-bold text-[48px] leading-[1.1em]'>Individual</h2>
            <h3 className='text-white text-[16px] font-bold'>R$29,90/mês</h3>
          </div>

          <div className='mt-5'>
            <div className='flex items-center gap-x-[10px]'>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <g clip-path="url(#clip0_5905_220)">
                <path d="M9 16.5C13.1421 16.5 16.5 13.1421 16.5 9C16.5 4.85786 13.1421 1.5 9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 13.1421 4.85786 16.5 9 16.5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6.75 9L8.25 10.5L11.25 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <defs>
                <clipPath id="clip0_5905_220">
                <rect width="18" height="18" fill="white"/>
                </clipPath>
                </defs>
              </svg>

              <p className='text-white text-[16px]'>Chat com IA</p>
            </div>

            <div className='flex items-center gap-x-[10px]'>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <g clip-path="url(#clip0_5905_220)">
                <path d="M9 16.5C13.1421 16.5 16.5 13.1421 16.5 9C16.5 4.85786 13.1421 1.5 9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 13.1421 4.85786 16.5 9 16.5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6.75 9L8.25 10.5L11.25 7.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </g>
                <defs>
                <clipPath id="clip0_5905_220">
                <rect width="18" height="18" fill="white"/>
                </clipPath>
                </defs>
              </svg>

              <p className='text-white text-[16px]'>Templates ilimitados</p>
            </div>

            <div className='flex items-center gap-x-[10px]'>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <g clip-path="url(#clip0_5905_220)">
                <path d="M9 16.5C13.1421 16.5 16.5 13.1421 16.5 9C16.5 4.85786 13.1421 1.5 9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 13.1421 4.85786 16.5 9 16.5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6.75 9L8.25 10.5L11.25 7.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </g>
                <defs>
                <clipPath id="clip0_5905_220">
                <rect width="18" height="18" fill="white"/>
                </clipPath>
                </defs>
              </svg>

              <p className='text-white text-[16px]'>Recorrências ilimitadas</p>
            </div>

            <div className='flex items-center gap-x-[10px]'>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <g clip-path="url(#clip0_5905_220)">
                <path d="M9 16.5C13.1421 16.5 16.5 13.1421 16.5 9C16.5 4.85786 13.1421 1.5 9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 13.1421 4.85786 16.5 9 16.5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6.75 9L8.25 10.5L11.25 7.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </g>
                <defs>
                <clipPath id="clip0_5905_220">
                <rect width="18" height="18" fill="white"/>
                </clipPath>
                </defs>
              </svg>

              <p className='text-white text-[16px]'>Central Educacional</p>
            </div>
          </div>
            <div  className=' mt-12 flex flex-col '>
              <button onClick={
                () =>{
                window.location.href="/cadastro"}} className='bg-[#00F059] tracking-tighter font-bold pl-24 pr-24 pt-3 pb-3 rounded-full self-center relative'>Começar<svg className='absolute right-[20%] translate-y-[-50%] top-[50%]' xmlns="http://www.w3.org/2000/svg" width="13" height="15" viewBox="0 0 13 15" fill="none">
<path d="M12.7071 8.0743C13.0976 7.68377 13.0976 7.05061 12.7071 6.66008L6.34315 0.29612C5.95262 -0.0944041 5.31946 -0.0944041 4.92893 0.29612C4.53841 0.686644 4.53841 1.31981 4.92893 1.71033L10.5858 7.36719L4.92893 13.024C4.53841 13.4146 4.53841 14.0477 4.92893 14.4383C5.31946 14.8288 5.95262 14.8288 6.34315 14.4383L12.7071 8.0743ZM0 7.36719L-8.74231e-08 8.36719L12 8.36719L12 7.36719L12 6.36719L8.74231e-08 6.36719L0 7.36719Z" fill="black"/>
</svg></button>
            </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="  py-8 bg-black mt-[-.05em]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logotransparente.png" alt="MonexAI" width={32} height={32} />
            <span className="font-semibold text-green-800">MonexAI</span>
          </div>
          <nav className="flex gap-6 text-sm text-gray-600">
            <Link href="/privacidade" className="hover:text-green-700">Privacidade</Link>
            <Link href="/termos" className="hover:text-green-700">Termos</Link>
          </nav>
          <p className="text-sm text-gray-500">
            © 2025 MonexAI. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>

    </div>

    </div>
  );
}
