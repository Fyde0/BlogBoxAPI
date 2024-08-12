interface IBlogSettings {
    theme: "minty" | "flatly" | "cosmo"
}

export function isIBlogSettings(obj: IBlogSettings): obj is IBlogSettings {
    return obj.theme ? true : false
}

export const defaultBlogSettings: IBlogSettings = {
    theme: "minty",
}

export default IBlogSettings