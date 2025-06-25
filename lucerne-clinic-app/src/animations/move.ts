import { createAnimation } from '@ionic/react';

export const moveAnimation = (baseEl: any, opts: any) => {
    const enteringAnimation = createAnimation()
        .addElement(opts.enteringEl)
        .fromTo('opacity', 0, 1)
        .duration(300);

    const leavingAnimation = createAnimation()
        .addElement(opts.leavingEl)
        .fromTo('opacity', 1, 0)
        .duration(300);

    return createAnimation()
        .addAnimation(enteringAnimation)
        .addAnimation(leavingAnimation);
};
