/**
 * @file 缓动算法们
 * 参数均依次为：
 * t 当前时间点
 * b 初始值
 * c 结束值
 * d 总时间点
 *
 * function is from TextFx
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

export let linear = function (t, b, c, d) {
    return c * t / d + b;
};

// exponential (2^t)
export let expoEaseOut = function (t, b, c, d) {
    return (t === d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
};

export let expoEaseIn = function (t, b, c, d) {
    return (t === 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
};

export let expoEaseInOut = function (t, b, c, d) {
    if (t === 0) {
        return b;
    }
    if (t === d) {
        return b + c;
    }
    if ((t /= d / 2) < 1) {
        return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
    }
    return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
};

export let expoEaseOutIn = function (t, b, c, d) {
    if (t < d / 2) {
        return expoEaseOut(t * 2, b, c / 2, d);
    }
    return expoEaseIn((t * 2) - d, b + c / 2, c / 2, d);
};

// circular (sqrt(1-t^2)) easing out
export let circEaseOut = function (t, b, c, d) {
    return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
};
export let circEaseIn = function (t, b, c, d) {
    return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
};
export let circEaseInOut = function (t, b, c, d) {
    if ((t /= d / 2) < 1) {
        return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
    }
    return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
};
export let circEaseOutIn = function (t, b, c, d) {
    if (t < d / 2) {
        return circEaseOut(t * 2, b, c / 2, d);
    }
    return circEaseIn((t * 2) - d, b + c / 2, c / 2, d);
};

// quadratic (t^2)
export let quadEaseOut = function (t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b;
};
export let quadEaseIn = function (t, b, c, d) {
    return c * (t /= d) * t + b;
};
export let quadEaseInOut = function (t, b, c, d) {
    if ((t /= d / 2) < 1) {
        return c / 2 * t * t + b;
    }
    return -c / 2 * ((--t) * (t - 2) - 1) + b;
};
export let quadEaseOutIn = function (t, b, c, d) {
    if (t < d / 2) {
        return quadEaseOut(t * 2, b, c / 2, d);
    }
    return quadEaseIn((t * 2) - d, b + c / 2, c / 2, d);
};

// cubic (t^3)
export let cubicEaseOut = function (t, b, c, d) {
    return c * ((t = t / d - 1) * t * t + 1) + b;
};
export let cubicEaseIn = function (t, b, c, d) {
    return c * (t /= d) * t * t + b;
};
export let cubicEaseInOut = function (t, b, c, d) {
    if ((t /= d / 2) < 1) {
        return c / 2 * t * t * t + b;
    }
    return c / 2 * ((t -= 2) * t * t + 2) + b;
};
export let cubicEaseOutIn = function (t, b, c, d) {
    if (t < d / 2) {
        return cubicEaseOut(t * 2, b, c / 2, d);
    }
    return cubicEaseIn((t * 2) - d, b + c / 2, c / 2, d);
};

// quartic (t^4)
export let quartEaseOut = function (t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
};
export let quartEaseIn = function (t, b, c, d) {
    return c * (t /= d) * t * t * t + b;
};
export let quartEaseInOut = function (t, b, c, d) {
    if ((t /= d / 2) < 1) {
        return c / 2 * t * t * t * t + b;
    }
    return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
};
export let quartEaseOutIn = function (t, b, c, d) {
    if (t < d / 2) {
        return quartEaseOut(t * 2, b, c / 2, d);
    }
    return quartEaseIn((t * 2) - d, b + c / 2, c / 2, d);
};

// quintic (t^5)
export let quintEaseOut = function (t, b, c, d) {
    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
};
export let quintEaseIn = function (t, b, c, d) {
    return c * (t /= d) * t * t * t * t + b;
};
export let quintEaseInOut = function (t, b, c, d) {
    if ((t /= d / 2) < 1) {
        return c / 2 * t * t * t * t * t + b;
    }
    return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
};
export let quintEaseOutIn = function (t, b, c, d) {
    if (t < d / 2) {
        return quintEaseOut(t * 2, b, c / 2, d);
    }
    return quintEaseIn((t * 2) - d, b + c / 2, c / 2, d);
};

// sinusoidal (sin(t))
export let sinEaseOut = function (t, b, c, d) {
    return c * Math.sin(t / d * (Math.PI / 2)) + b;
};
export let sinEaseIn = function (t, b, c, d) {
    return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
};
export let sinEaseInOut = function (t, b, c, d) {
    if ((t /= d / 2) < 1) {
        return c / 2 * (Math.sin(Math.PI * t / 2)) + b;
    }
    return -c / 2 * (Math.cos(Math.PI * --t / 2) - 2) + b;
};
export let sinEaseOutIn = function (t, b, c, d) {
    if (t < d / 2) {
        return sinEaseOut(t * 2, b, c / 2, d);
    }
    return sinEaseIn((t * 2) - d, b + c / 2, c / 2, d);
};

// elastic (exponentially decaying sine wave)
export let elasticEaseOut = function (t, b, c, d) {
    if ((t /= d) === 1) {
        return b + c;
    }

    let p = d * 0.3;
    let s = p / 4;

    return (c * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
};
export let elasticEaseIn = function (t, b, c, d) {
    if ((t /= d) === 1) {
        return b + c;
    }

    let p = d * 0.3;
    let s = p / 4;

    return -(c * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
};
export let elasticEaseInOut = function (t, b, c, d) {
    if ((t /= d / 2) === 2) {
        return b + c;
    }

    let p = d * (0.3 * 1.5);
    let s = p / 4;

    if (t < 1) {
        return -0.5 * (c * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    }
    return c * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
};
export let elasticEaseOutIn = function (t, b, c, d) {
    if (t < d / 2) {
        return elasticEaseOut(t * 2, b, c / 2, d);
    }
    return elasticEaseIn((t * 2) - d, b + c / 2, c / 2, d);
};

// bounce (exponentially decaying parabolic bounce)
export let bounceEaseOut = function (t, b, c, d) {
    if ((t /= d) < (1 / 2.75)) {
        return c * (7.5625 * t * t) + b;
    }
    else if (t < (2 / 2.75)) {
        return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
    }
    else if (t < (2.5 / 2.75)) {
        return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
    }

    return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
};
export let bounceEaseIn = function (t, b, c, d) {
    return c - bounceEaseOut(d - t, 0, c, d) + b;
};
export let bounceEaseInOut = function (t, b, c, d) {
    if (t < d / 2) {
        return bounceEaseIn(t * 2, 0, c, d) * 0.5 + b;
    }
    return bounceEaseOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
};
export let bounceEaseOutIn = function (t, b, c, d) {
    if (t < d / 2) {
        return bounceEaseOut(t * 2, b, c / 2, d);
    }
    return bounceEaseIn((t * 2) - d, b + c / 2, c / 2, d);
};

// overshooting cubic easing: (s+1)*t^3 - s*t^2)
export let overshootingEaseOut = function (t, b, c, d) {
    return c * ((t = t / d - 1) * t * ((1.70158 + 1) * t + 1.70158) + 1) + b;
};
export let overshootingEaseIn = function (t, b, c, d) {
    return c * (t /= d) * t * ((1.70158 + 1) * t - 1.70158) + b;
};
export let overshootingEaseInOut = function (t, b, c, d) {
    let s = 1.70158;
    if ((t /= d / 2) < 1) {
        return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
    }
    return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
};
export let overshootingEaseOutIn = function (t, b, c, d) {
    if (t < d / 2) {
        return overshootingEaseOut(t * 2, b, c / 2, d);
    }
    return overshootingEaseIn((t * 2) - d, b + c / 2, c / 2, d);
};
