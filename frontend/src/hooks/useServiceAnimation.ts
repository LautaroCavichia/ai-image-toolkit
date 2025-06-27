import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ServiceAnimationOptions {
  serviceType: 'background-removal' | 'upscale' | 'enlarge' | 'object-removal' | 'style-transfer';
  enablePreloader?: boolean;
  intensity?: 'subtle' | 'medium' | 'intense';
}

export const useServiceAnimation = ({ 
  serviceType, 
  enablePreloader = false,
  intensity = 'medium' 
}: ServiceAnimationOptions) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const uploaderRef = useRef<HTMLDivElement>(null);
  const configRef = useRef<HTMLDivElement>(null);
  const workflowRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const preloaderRef = useRef<HTMLDivElement>(null);

  // Service-specific animation configs
  const getAnimationConfig = (type: string) => {
    const configs = {
      'background-removal': {
        hero: { duration: 1.4, delay: 0, ease: "power4.out", scale: 0.9, rotation: 2, y: 40 },
        uploader: { duration: 1.2, delay: -0.9, ease: "power3.out", scale: 0.95, rotation: 0, y: 50 },
        config: { duration: 1.0, delay: -0.7, ease: "power3.out", scale: 0.98, rotation: 0, y: 30 },
        workflow: { duration: 0.9, delay: -0.5, ease: "power2.out", scale: 1.02, rotation: 0, y: 20 },
        features: { duration: 0.8, delay: -0.3, ease: "power2.out", scale: 1.0, rotation: 0, y: 15 },
        workflowStagger: 0.15,
        primaryColor: '#dc2626' // red
      },
      'upscale': {
        hero: { duration: 1.6, delay: 0, ease: "power4.out", scale: 0.85, rotation: -1, y: 40 },
        uploader: { duration: 1.3, delay: -1.0, ease: "power3.out", scale: 0.92, rotation: 0, y: 60 },
        config: { duration: 1.1, delay: -0.8, ease: "power3.out", scale: 0.96, rotation: 0, y: 40 },
        workflow: { duration: 1.0, delay: -0.6, ease: "power2.out", scale: 1.03, rotation: 0, y: 25 },
        features: { duration: 0.9, delay: -0.4, ease: "power2.out", scale: 1.01, rotation: 0, y: 20 },
        workflowStagger: 0.18,
        primaryColor: '#059669' // emerald
      },
      'enlarge': {
        hero: { duration: 1.5, delay: 0, ease: "power4.out", scale: 0.88, rotation: 1.5, y: 40 },
        uploader: { duration: 1.2, delay: -1.0, ease: "power3.out", scale: 0.94, rotation: 0, y: 45 },
        config: { duration: 1.0, delay: -0.8, ease: "power3.out", scale: 0.97, rotation: 0, y: 35 },
        workflow: { duration: 0.9, delay: -0.6, ease: "power2.out", scale: 1.02, rotation: 0, y: 22 },
        features: { duration: 0.8, delay: -0.4, ease: "power2.out", scale: 1.0, rotation: 0, y: 18 },
        workflowStagger: 0.16,
        primaryColor: '#7c3aed' // violet
      },
      'object-removal': {
        hero: { duration: 1.3, delay: 0, ease: "power4.out", scale: 0.91, rotation: -2, y: 40 },
        uploader: { duration: 1.1, delay: -0.8, ease: "power3.out", scale: 0.96, rotation: 0, y: 40 },
        config: { duration: 0.9, delay: -0.6, ease: "power3.out", scale: 0.98, rotation: 0, y: 28 },
        workflow: { duration: 0.8, delay: -0.4, ease: "power2.out", scale: 1.01, rotation: 0, y: 18 },
        features: { duration: 0.7, delay: -0.2, ease: "power2.out", scale: 1.0, rotation: 0, y: 12 },
        workflowStagger: 0.14,
        primaryColor: '#ea580c' // orange
      },
      'style-transfer': {
        hero: { duration: 1.7, delay: 0, ease: "power4.out", scale: 0.82, rotation: 3, y: 40 },
        uploader: { duration: 1.4, delay: -1.1, ease: "power3.out", scale: 0.9, rotation: 0, y: 70 },
        config: { duration: 1.2, delay: -0.9, ease: "power3.out", scale: 0.95, rotation: 0, y: 50 },
        workflow: { duration: 1.1, delay: -0.7, ease: "power2.out", scale: 1.04, rotation: 0, y: 30 },
        features: { duration: 1.0, delay: -0.5, ease: "power2.out", scale: 1.02, rotation: 0, y: 25 },
        workflowStagger: 0.2,
        primaryColor: '#db2777' // pink
      }
    };
    return configs[type as keyof typeof configs] || configs['background-removal'];
  };

  const createPreloaderAnimation = () => {
    if (!preloaderRef.current) return;

    const tl = gsap.timeline();
    
    // Preloader entrance
    tl.fromTo(preloaderRef.current, 
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }
    );

    // Spinning animation for 1.5 seconds
    tl.to(preloaderRef.current.querySelector('.preloader-spinner'), {
      rotation: 360,
      duration: 1.5,
      ease: "none",
      repeat: -1
    }, 0.3);

    // Exit animation (faster)
    tl.to(preloaderRef.current, {
      opacity: 0,
      scale: 0.9,
      y: -20,
      duration: 0.6,
      ease: "power3.in",
      delay: 1.5
    });

    return tl;
  };

  const createEntranceAnimations = () => {
    const config = getAnimationConfig(serviceType);
    const elements = [heroRef.current, uploaderRef.current, configRef.current, workflowRef.current, featuresRef.current];
    const keys = ['hero', 'uploader', 'config', 'workflow', 'features'] as const;
    
    // Filter out null elements and their corresponding configs
    const validElements = elements.map((el, index) => ({ el, config: config[keys[index]], key: keys[index] }))
      .filter(({ el }) => el !== null);

    if (validElements.length === 0) return;

    // Set initial states IMMEDIATELY to prevent flash
    validElements.forEach(({ el, config: elementConfig }) => {
      gsap.set(el, {
        opacity: 0,
        y: elementConfig.y || 40,
        scale: elementConfig.scale || 0.95,
        rotation: elementConfig.rotation || 0,
        filter: 'blur(8px)',
        transformOrigin: 'center center'
      });
    });

    const tl = gsap.timeline({ delay: enablePreloader ? 2.2 : 0.1 });

    // Animate elements in sequence with dynamic properties
    validElements.forEach(({ el, config: elementConfig }, index) => {
      tl.to(el, {
        opacity: 1,
        y: 0,
        scale: 1,
        rotation: 0,
        filter: 'blur(0px)',
        duration: elementConfig.duration,
        ease: elementConfig.ease
      }, index === 0 ? 0 : elementConfig.delay);
    });

    // Enhanced workflow cards animation (snappier timing)
    setTimeout(() => {
      const workflowCards = workflowRef.current?.querySelectorAll('.workflow-card');
      
      if (workflowCards && workflowCards.length > 0) {
        // Animate workflow cards with enhanced effects (faster)
        gsap.fromTo(workflowCards, 
          { 
            opacity: 0, 
            y: 40,
            scale: 0.9,
            rotation: 2,
            filter: 'blur(6px)'
          },
          { 
            opacity: 1, 
            y: 0,
            scale: 1,
            rotation: 0,
            filter: 'blur(0px)',
            duration: 0.8, // Faster duration
            stagger: Math.max(config.workflowStagger * 0.7, 0.1), // Faster stagger
            ease: "power3.out",
            onComplete: () => {
              // Add subtle hover animations
              workflowCards.forEach((card) => {
                const cardElement = card as HTMLElement;
                cardElement.addEventListener('mouseenter', () => {
                  gsap.to(cardElement, {
                    y: -3,
                    scale: 1.01,
                    duration: 0.2,
                    ease: "power2.out"
                  });
                });
                
                cardElement.addEventListener('mouseleave', () => {
                  gsap.to(cardElement, {
                    y: 0,
                    scale: 1,
                    duration: 0.2,
                    ease: "power2.out"  
                  });
                });
              });
            }
          }
        );
      }
    }, enablePreloader ? 3000 : 1400);

    return tl;
  };

  // Set initial states immediately to prevent flash
  const setInitialStates = () => {
    const config = getAnimationConfig(serviceType);
    const elements = [heroRef.current, uploaderRef.current, configRef.current, workflowRef.current, featuresRef.current];
    const keys = ['hero', 'uploader', 'config', 'workflow', 'features'] as const;
    
    elements.forEach((el, index) => {
      if (el) {
        const elementConfig = config[keys[index]];
        gsap.set(el, {
          opacity: 0,
          y: elementConfig.y || 40,
          scale: elementConfig.scale || 0.95,
          rotation: elementConfig.rotation || 0,
          filter: 'blur(8px)',
          transformOrigin: 'center center'
        });
      }
    });
  };

  // Use useLayoutEffect to set initial states immediately (before paint)
  useLayoutEffect(() => {
    // Set initial states immediately when refs are available
    const config = getAnimationConfig(serviceType);
    const elements = [heroRef.current, uploaderRef.current, configRef.current, workflowRef.current, featuresRef.current];
    const keys = ['hero', 'uploader', 'config', 'workflow', 'features'] as const;
    
    elements.forEach((el, index) => {
      if (el) {
        const elementConfig = config[keys[index]];
        gsap.set(el, {
          opacity: 0,
          y: elementConfig.y || 40,
          scale: elementConfig.scale || 0.95,
          rotation: elementConfig.rotation || 0,
          filter: 'blur(8px)',
          transformOrigin: 'center center'
        });
      }
    });
  }, []); // Run only once when component mounts

  useEffect(() => {
    let preloaderTimeline: gsap.core.Timeline | undefined;
    let entranceTimeline: gsap.core.Timeline | undefined;

    if (enablePreloader) {
      preloaderTimeline = createPreloaderAnimation();
    }
    
    entranceTimeline = createEntranceAnimations();

    // Cleanup function
    return () => {
      preloaderTimeline?.kill();
      entranceTimeline?.kill();
    };
  }, [serviceType, enablePreloader, intensity, createPreloaderAnimation, createEntranceAnimations]);

  return {
    heroRef,
    uploaderRef,
    configRef,
    workflowRef,
    featuresRef,
    preloaderRef
  };
};