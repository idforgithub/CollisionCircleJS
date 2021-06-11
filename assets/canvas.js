let canvas = document.querySelector("canvas")

canvas.width = innerWidth
canvas.height = innerHeight

let context = canvas.getContext('2d')

let mouseVector = {
    x: undefined,
    y: undefined
}

addEventListener('mousemove', function (event) {
    mouseVector.x = event.x
    mouseVector.y = event.y
})

addEventListener('mouseout', function (event) {
    mouseVector.x = undefined
    mouseVector.y = undefined
})

class Circle{

    velocity = {
        x: undefined,
        y: undefined
    }

    tick = 1
    mass = 1
    opacity = 0

    constructor(x = 0, y = 0, radius = 0, color = 'black'){
        this.vector = {
            x: x,
            y: y
        }

        this.radius = radius
        this.color = color

        this.#fixPosition()
        this.randomSpeed(false)
    }

    #fixPosition(){
        this.vector.x = (this.vector.x + this.radius) > innerWidth ? (this.vector.x - this.radius) : this.vector.x
        this.vector.x = (this.vector.x - this.radius) < 0 ? (this.vector.x + this.radius) : this.vector.x
        
        this.vector.y = (this.vector.y + this.radius > innerHeight) ? (this.vector.y - this.radius) : this.vector.y
        this.vector.y = (this.vector.y - this.radius) < 0 ? (this.vector.y + this.radius) : this.vector.y
    }

    randomSpeed(isRandom = true){
        this.velocity = {
            x: (isRandom ? Math.random().toFixed(1) : 1) * (Math.random() < 0.9 ? this.tick : -this.tick),
            y: (isRandom ? Math.random().toFixed(1) : 1) * (Math.random() < 0.9 ? this.tick : -this.tick)
        }
    }

    draw(){
        context.beginPath()
        context.arc(this.vector.x, this.vector.y, this.radius, 0, Math.pow(Math.PI, 2))
        context.save()
        context.globalAlpha = this.opacity
        context.fillStyle = this.color
        context.fill()
        context.restore()
        context.strokeStyle = this.color
        context.stroke()
        context.closePath()
    }

    collideUpdate(circles){
        circles.forEach(circleFromArray => {
            if(this !== circleFromArray){
                const distance = distanceBetweenCircle(this, circleFromArray)
                if(distance <= 0){
                    resolveCollision(this, circleFromArray)
                    this.color = requestColor()
                    circleFromArray.color = requestColor()
                }
            }
        })
        this.update()
    }

    update(){
        if( this.vector.x + this.radius > innerWidth || this.vector.x - this.radius < 0)
            this.velocity.x = -this.velocity.x
        
        if( this.vector.y + this.radius > innerHeight || this.vector.y - this.radius < 0)
            this.velocity.y = -this.velocity.y
        
        
        if(calculateDistance(mouseVector.x, mouseVector.y, this.vector.x, this.vector.y) < mouseInteractRadius){
            this.opacity += .1
            this.opacity = Math.min(this.opacity, 1)
        } else {
            this.opacity -= .1
            this.opacity = Math.max(this.opacity, 0)
        }

        this.vector.x += this.velocity.x
        this.vector.y += this.velocity.y

        this.draw()
    }
}

function rotate(velocity = {x: undefined, y: undefined}, angle = undefined){
    return {
        x: velocity.x * Math.cos(angle) + velocity.y * Math.sin(angle),
        y: -velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    }
}

function resolveCollision(circle1, circle2){
    const velocityDiff = {
        x: circle1.velocity.x - circle2.velocity.x,
        y: circle1.velocity.y - circle2.velocity.y
    }
    const distance = {
        x: circle2.vector.x - circle1.vector.x,
        y: circle2.vector.y - circle1.vector.y
    }

    if((velocityDiff.x * distance.x) + (velocityDiff.y * distance.y) >= 0){
        const angle = Math.atan2(circle2.vector.y - circle1.vector.y, circle2.vector.x - circle1.vector.x)

        const m1 = circle1.mass
        const m2 = circle2.mass

        const u1 = rotate(circle1.velocity, angle)
        const u2 = rotate(circle2.velocity, angle)
        
        const v1 = { 
            x: (u1.x * (m1 - m2) + ((m2 * 2) * u2.x)) / 
                         (m1 + m2),
            y: u1.y
        }
        const v2 = {
            x: (u2.x * (m2 - m1) + ((m1 * 2) * u1.x)) / 
                         (m1 + m2),
            y: u2.y
        }

        circle1.velocity = rotate(v1, -angle)
        circle2.velocity = rotate(v2, -angle)
    }
}

function strColorRGBA(red = 0, green = 0, blue = 0, alpha = 1.0) {
    return "rgba("+red+", "+green+", "+blue+", "+alpha+")"
}

function randomNumber(number1, number2, rounding = false) {
    return rounding ? 
        Math.floor( randomNumber(number1, number2, false)) : 
        Math.random() * (number2 - number1) + number1
}

function requestColor(){
    return strColorRGBA(
        randomNumber(0, 255, true),
        randomNumber(0, 255, true),
        randomNumber(0, 255, true),
        randomNumber(0.2, 1.0),
    )
}

var rMinMax = {
    min: undefined,
    max: undefined
}
const circles = []

function requestRadius(min = 10, max = 100) {
    rMinMax = {
        min: min,
        max: max
    }
}

function instantiate(target = 0, index = 0) {
    if(index < target){
        const radius = randomNumber(rMinMax.min, rMinMax.max)
        const circle = new Circle(
            randomNumber(radius, innerWidth - radius),  // X
            randomNumber(radius, innerHeight - radius), // Y
            radius,                                     // R (radius)
            requestColor()                              // Color
        )
        circle.tick = randomNumber(2, 10)
        circle.randomSpeed()
        circles.push(circle)
        
        return instantiate(target, index+1)
    }
}

function distanceBetweenCircle(circle1, circle2) {
    return calculateDistance(circle1.vector.x, circle1.vector.y, circle2.vector.x, circle2.vector.y) - (circle1.radius + circle2.radius)
}

function calculateDistance(x1 = 0, y1 = 0, x2 = 0, y2 = 0){
    return Math.hypot(x2 - x1, y2 - y1)
}

function animation(){
    requestAnimationFrame(animation)
    context.clearRect(0, 0, canvas.width, canvas.height)

    circles.forEach(c => {
        c.collideUpdate(circles)
    })
    
}

// set interactive between mouse and the circles
mouseInteractRadius = 100

// set radius on circle, by default min = 10 and max = 100
requestRadius(min = 5, max = 8)

// target = (how much circle to instantiate)
instantiate(target = 500)

// run animation
animation()