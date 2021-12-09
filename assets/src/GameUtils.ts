



export let GameUtils = {



    // // 返回nMin-nMax之间的随机整数 [min, max]
    getIntRandom(nMin, nMax): number
    {
        if (nMax <= nMin)
        {
            return nMax;
        }
        return Math.floor(Math.random() * (nMax - nMin + 1) + nMin)
    }

}
