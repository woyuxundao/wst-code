// import { ajax } from "./ajax"
// import { wst  } from "./code"
import { icode } from "./interface"

const module: HTMLElement | null = document.getElementById("module") as HTMLElement;
const result: HTMLElement | null = document.getElementById("result") as HTMLElement;
const chassis: HTMLInputElement | null = document.getElementById("chassis") as HTMLInputElement
const bezel: HTMLInputElement | null = document.getElementById("bezel") as HTMLInputElement
const clearButton: HTMLButtonElement | null = document.getElementById("clear") as HTMLButtonElement
const ok: HTMLAudioElement | null = document.getElementById("OK") as HTMLAudioElement
const invalid: HTMLAudioElement | null = document.getElementById("invalid") as HTMLAudioElement

type ResultType = [boolean, string]
type SoundType = "OK" | "invalid"
interface FutureResultType {
    resultFlag: boolean
    result : icode
}

function sound(type: SoundType) {
    if (ok === null || invalid === null) {
        throw new Error("不存在音频")
    }
    switch (type) {
        case "OK":
            ok.play()
            break
        case "invalid":
            invalid.play()
            break
        default:
            throw new Error("不存在的类别")
    }
}

function showResult(res: HTMLElement, rt: ResultType) {
    if (rt[0]) {
        res.innerHTML = "验证成功：" + rt[1]
        res.className = "sucess"
        sound("OK")
    } else {
        res.innerHTML = "验证失败：" + rt[1]
        res.className = "fail"
        sound("invalid")
    }

}
let wst: FutureResultType = { resultFlag: false, result: {} }
fetch("code.json").then(
    res => res.json().then(data => {
        // console.log("data",data)
        wst.resultFlag = true
        wst.result = data as icode
        })
).catch(e=>console.log("json数据无法获取",e.toString()))     

class Check {
    private _module: string = ""
    private _chassis: string = ""
    private _bezel: string = ""
    content: FutureResultType = wst

    codeCheck(code: string, pattern: string): ResultType {
        if (!this.content.resultFlag) {
            return [false, "数据未加载成功"]
        }
        let tmp = this.content.result
        if (pattern === "chassis") {
            if (this._module.length > 0) {
                if (this._module === code) {
                    return [true, code]
                } else {
                    return [false, code + "<br>" + "机型条码不匹配"]
                }

            }
            for (let module in tmp) {
                for (let chassis in tmp[module]) {
                    // console.log("code chassis", code, chassis)
                    if (code == chassis) {
                        this._module = chassis
                        this._bezel = tmp[module][chassis]
                        return [true, code]
                    }

                }
            }
            return [false, code + "<br>" + "机型未找到"]

        }
        if (pattern === "bezel") {
            if (this._bezel.length > 0) {
                if (this._bezel === code) {
                    return [true, code]
                } else {
                    return [false, code + "<br>" + "面板条码不匹配"]
                }

            } else {
                return [false, "程序错误，面板无法匹配"]
            }


        }
        return [false, "无法找到匹配的模式"]
    }

    clear(): void {
        this._module = ""
    }
}

if (clearButton === null || chassis === null || bezel === null || result === null || module === null) {
    console.log("未找到按键")
    throw new Error("按键不存在")
} else {
    window.onload = () => {
        chassis.focus()
    }
    let ck: Check = new Check()
    clearButton.addEventListener("click", (evt: Event) => {
        // evt.preventDefault()
        module.innerHTML = "无"
        result.innerHTML = ""
        chassis.value = bezel.value = ""
        ck.clear()
        //清理相关数据
        console.log("清除按键被点击了")
    })

    chassis.addEventListener("keydown", (evt: KeyboardEvent) => {
        if (evt.key === "Enter") {
            // console.log("key code is ",evt.code)
            let res: ResultType = ck.codeCheck(chassis.value, 'chassis')
            // console.log("enter按键被按下")
            if (res[0]) {
                module.innerHTML = chassis.value
                module.innerHTML = chassis.value
                bezel.focus()
            } else {
                chassis.value = ""
            }
            showResult(result, res)
        }
    })
    bezel.addEventListener("keydown", (evt: KeyboardEvent) => {
        if (evt.key === "Enter") {
            // console.log("key code is ",evt.code)
            let res: ResultType = ck.codeCheck(bezel.value, 'bezel')
            // console.log("enter按键被按下")
            if (res[0]) {
                bezel.value = ""
                chassis.value = ""
                chassis.focus()
            } else {
                bezel.value = ""
            }
            showResult(result, res)
        }
    })
    bezel.addEventListener("focus", (evt: FocusEvent) => {

        if (chassis.value === "") {
            chassis.focus()
        }
    })

}


