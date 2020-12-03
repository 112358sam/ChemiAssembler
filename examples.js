function saltex(){
return `#Example script showing the basic mov operation
#Makes 66 salt

#Load slot 1 with 33+ water
#Load slot 2 with 33+ sodium
#Load slot 3 with 33+ chlorine
#Load slot 4 with an empty beaker

mov 33, 1, 4
mov 33, 2, 4
mov 33, 3, 4
`
}
function char1ex(){
return `#Example script showing how to make charcoal from only basic ingredients
#Makes 100 charcoal

#Load slot 1 with 50+ paper
#Load slot 2 with 25+ water
#Load slot 3 with 25+ sodium
#Load slot 4 with 25+ chlorine
#Load slot 5 with an empty beaker

temp 1, 424

mov 25, 2, 5
mov 25, 3, 5
mov 25, 4, 5
mov 50, 1, 5

temp 5, 374
`
}
function char2ex(){
return `#Example script showing how to make charcoal with chemgroup inputs
#Makes 100 charcoal

#Load slot 1 with 50+ paper
#Load slot 2 with water=25;chlorine=25;sodium=25
#Load slot 3 with an empty beaker

temp 1, 424
mov 75, 2, 3
mov 50, 1, 3
temp 3, 374 
`
}
function glassex(){
return `#Example script showing how to make 20 vials of water for quickly producing glass
#Adjust

#Load slot 1 with 100 water, or anything else

#Adjust the sfor value to set the number of vials
sfor 20
mov 5, 1, 12
end
`
}